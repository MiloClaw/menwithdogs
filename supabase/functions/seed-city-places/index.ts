import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SeedRequest {
  city_name: string;
  lat: number;
  lng: number;
  radius_meters?: number;
  google_types: string[];
  max_results_per_type?: number;
}

interface PlaceResult {
  google_place_id: string;
  name: string;
  lat: number;
  lng: number;
  google_types: string[];
  google_primary_type: string | null;
  rating: number | null;
  user_ratings_total: number | null;
}

interface SeedResult {
  imported_count: number;
  skipped_count: number;
  errors: string[];
  places: PlaceResult[];
}

// Input validation
function validateRequest(body: unknown): { valid: true; data: SeedRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  if (typeof data.city_name !== 'string' || data.city_name.length < 1 || data.city_name.length > 200) {
    return { valid: false, error: 'city_name must be a string between 1-200 characters' };
  }
  
  if (typeof data.lat !== 'number' || data.lat < -90 || data.lat > 90) {
    return { valid: false, error: 'lat must be a number between -90 and 90' };
  }
  
  if (typeof data.lng !== 'number' || data.lng < -180 || data.lng > 180) {
    return { valid: false, error: 'lng must be a number between -180 and 180' };
  }
  
  if (!Array.isArray(data.google_types) || data.google_types.length === 0 || data.google_types.length > 50) {
    return { valid: false, error: 'google_types must be an array with 1-50 items' };
  }
  
  for (const type of data.google_types) {
    if (typeof type !== 'string' || type.length > 100) {
      return { valid: false, error: 'Each google_type must be a string under 100 characters' };
    }
  }
  
  const radius_meters = typeof data.radius_meters === 'number' ? data.radius_meters : 5000;
  if (radius_meters < 100 || radius_meters > 50000) {
    return { valid: false, error: 'radius_meters must be between 100 and 50000' };
  }
  
  const max_results_per_type = typeof data.max_results_per_type === 'number' ? data.max_results_per_type : 20;
  if (max_results_per_type < 1 || max_results_per_type > 60) {
    return { valid: false, error: 'max_results_per_type must be between 1 and 60' };
  }
  
  return {
    valid: true,
    data: {
      city_name: data.city_name,
      lat: data.lat,
      lng: data.lng,
      radius_meters,
      google_types: data.google_types as string[],
      max_results_per_type,
    }
  };
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

    // Verify user and check admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;
    
    // Check admin role using service client
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

    const { city_name, lat, lng, radius_meters, google_types, max_results_per_type } = validation.data;

    console.log(`Admin ${userId} seeding places for ${city_name} at (${lat}, ${lng}) with radius ${radius_meters}m`);
    console.log(`Google types to search: ${google_types.join(", ")}`);

    const result: SeedResult = {
      imported_count: 0,
      skipped_count: 0,
      errors: [],
      places: []
    };

    // Fetch existing google_place_ids to avoid duplicates
    const { data: existingPlaces } = await supabaseAdmin
      .from("places")
      .select("google_place_id");
    
    const existingIds = new Set((existingPlaces || []).map(p => p.google_place_id));

    // Search for each Google type
    for (const googleType of google_types) {
      try {
        console.log(`Searching for type: ${googleType}`);
        
        const searchUrl = "https://places.googleapis.com/v1/places:searchNearby";
        const searchBody = {
          includedTypes: [googleType],
          maxResultCount: max_results_per_type,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius_meters
            }
          }
        };

        const searchResponse = await fetch(searchUrl, {
          method: "POST",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.types,places.primaryType,places.rating,places.userRatingCount",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(searchBody)
        });

        const searchData = await searchResponse.json();

        if (searchData.error) {
          console.error(`Error searching for ${googleType}:`, searchData.error.message);
          result.errors.push(`${googleType}: ${searchData.error.message}`);
          continue;
        }

        const places = searchData.places || [];
        console.log(`Found ${places.length} places for ${googleType}`);

        for (const place of places) {
          const placeId = place.id;
          
          if (existingIds.has(placeId)) {
            result.skipped_count++;
            continue;
          }

          const placeResult: PlaceResult = {
            google_place_id: placeId,
            name: place.displayName?.text || "Unknown",
            lat: place.location?.latitude,
            lng: place.location?.longitude,
            google_types: place.types || [],
            google_primary_type: place.primaryType || null,
            rating: place.rating || null,
            user_ratings_total: place.userRatingCount || null
          };

          result.places.push(placeResult);
          existingIds.add(placeId);
        }
      } catch (typeError) {
        console.error(`Error processing type ${googleType}:`, typeError);
        result.errors.push(`${googleType}: ${String(typeError)}`);
      }
    }

    result.imported_count = result.places.length;

    console.log(`Seed complete: ${result.imported_count} new places found, ${result.skipped_count} skipped`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in seed-city-places:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
