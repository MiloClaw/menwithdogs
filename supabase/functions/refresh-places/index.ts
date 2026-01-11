import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefreshRequest {
  batch_size?: number;
  max_age_days?: number;
}

interface RefreshResult {
  refreshed_count: number;
  skipped_count: number;
  errors: string[];
}

// Input validation
function validateRequest(body: unknown): { valid: true; data: RefreshRequest } | { valid: false; error: string } {
  if (body === null || body === undefined) {
    return { valid: true, data: { batch_size: 50, max_age_days: 7 } };
  }
  
  if (typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  const batch_size = typeof data.batch_size === 'number' ? data.batch_size : 50;
  if (batch_size < 1 || batch_size > 500) {
    return { valid: false, error: 'batch_size must be between 1 and 500' };
  }
  
  const max_age_days = typeof data.max_age_days === 'number' ? data.max_age_days : 7;
  if (max_age_days < 1 || max_age_days > 365) {
    return { valid: false, error: 'max_age_days must be between 1 and 365' };
  }
  
  return { valid: true, data: { batch_size, max_age_days } };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION: Admin Only ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;
    
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // ========== END AUTHENTICATION ==========

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const rawBody = await req.json().catch(() => null);
    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { batch_size, max_age_days } = validation.data;

    console.log(`Admin ${userId} refreshing places older than ${max_age_days} days, batch size: ${batch_size}`);

    // Find stale places
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - max_age_days!);

    const { data: stalePlaces, error: fetchError } = await supabaseAdmin
      .from("places")
      .select("id, google_place_id, name")
      .eq("is_active", true)
      .or(`last_fetched_at.is.null,last_fetched_at.lt.${cutoffDate.toISOString()}`)
      .limit(batch_size!);

    if (fetchError) {
      console.error("Error fetching stale places:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch stale places" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: RefreshResult = {
      refreshed_count: 0,
      skipped_count: 0,
      errors: []
    };

    if (!stalePlaces || stalePlaces.length === 0) {
      console.log("No stale places to refresh");
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${stalePlaces.length} stale places to refresh`);

    for (const place of stalePlaces) {
      try {
        const fieldMask = [
          "id", "displayName", "formattedAddress", "addressComponents",
          "location", "rating", "userRatingCount", "priceLevel",
          "websiteUri", "internationalPhoneNumber", "googleMapsUri",
          "regularOpeningHours", "photos", "primaryType", "primaryTypeDisplayName",
          "types", "businessStatus", "utcOffsetMinutes"
        ].join(",");

        const detailsUrl = `https://places.googleapis.com/v1/places/${place.google_place_id}?languageCode=en`;
        
        const response = await fetch(detailsUrl, {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": fieldMask,
          },
        });

        const data = await response.json();

        if (data.error) {
          console.error(`Error fetching ${place.google_place_id}:`, data.error.message);
          result.errors.push(`${place.name}: ${data.error.message}`);
          result.skipped_count++;
          continue;
        }

        let city: string | null = null;
        let state: string | null = null;
        let country: string | null = null;

        for (const component of data.addressComponents || []) {
          const types = component.types || [];
          if (types.includes("locality")) {
            city = component.longText;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.shortText;
          } else if (types.includes("country")) {
            country = component.shortText;
          }
        }

        let photos = null;
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          photos = data.photos.slice(0, 5).map((photo: { name: string; widthPx?: number; heightPx?: number }) => ({
            name: photo.name,
            widthPx: photo.widthPx || 0,
            heightPx: photo.heightPx || 0,
          }));
        }

        let opening_hours = null;
        if (data.regularOpeningHours?.weekdayDescriptions) {
          opening_hours = {
            weekday_text: data.regularOpeningHours.weekdayDescriptions,
          };
        }

        let price_level: number | null = null;
        if (data.priceLevel) {
          const priceLevelMap: Record<string, number> = {
            "PRICE_LEVEL_FREE": 0,
            "PRICE_LEVEL_INEXPENSIVE": 1,
            "PRICE_LEVEL_MODERATE": 2,
            "PRICE_LEVEL_EXPENSIVE": 3,
            "PRICE_LEVEL_VERY_EXPENSIVE": 4,
          };
          price_level = priceLevelMap[data.priceLevel] ?? null;
        }

        const { error: updateError } = await supabaseAdmin
          .from("places")
          .update({
            name: data.displayName?.text || place.name,
            formatted_address: data.formattedAddress,
            city,
            state,
            country,
            lat: data.location?.latitude,
            lng: data.location?.longitude,
            rating: data.rating,
            user_ratings_total: data.userRatingCount,
            price_level,
            website_url: data.websiteUri,
            phone_number: data.internationalPhoneNumber,
            google_maps_url: data.googleMapsUri,
            opening_hours,
            photos,
            google_primary_type: data.primaryType,
            google_primary_type_display: data.primaryTypeDisplayName?.text,
            google_types: data.types || [],
            business_status: data.businessStatus,
            utc_offset_minutes: data.utcOffsetMinutes,
            last_fetched_at: new Date().toISOString(),
            fetch_version: 2,
          })
          .eq("id", place.id);

        if (updateError) {
          console.error(`Error updating ${place.name}:`, updateError);
          result.errors.push(`${place.name}: ${updateError.message}`);
          result.skipped_count++;
          continue;
        }

        await supabaseAdmin
          .from("places_google_snapshots")
          .insert({
            place_id: place.id,
            raw_response: data,
            source: "google_places"
          });

        result.refreshed_count++;
        console.log(`Refreshed: ${place.name}`);

      } catch (placeError) {
        console.error(`Error processing ${place.name}:`, placeError);
        result.errors.push(`${place.name}: ${String(placeError)}`);
        result.skipped_count++;
      }
    }

    console.log(`Refresh complete: ${result.refreshed_count} refreshed, ${result.skipped_count} skipped`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in refresh-places:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
