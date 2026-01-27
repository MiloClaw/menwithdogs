import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DetailsRequest {
  place_id: string;
  sessionToken?: string;
  includeReviews?: boolean;
}

interface Review {
  text: string;
  rating: number;
  relativePublishTimeDescription?: string;
}

interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  county: string | null; // For metro rollup logic
  lat: number | null;
  lng: number | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  website_url: string | null;
  phone_number: string | null;
  google_maps_url: string | null;
  opening_hours: { weekday_text: string[] } | null;
  photos: PhotoReference[] | null;
  google_primary_type: string | null;
  google_primary_type_display: string | null;
  google_types: string[];
  business_status: string | null;
  utc_offset_minutes: number | null;
  reviews?: Review[];
  raw_response?: Record<string, unknown>;
  // Amenity/accessibility fields
  allows_dogs: boolean | null;
  wheelchair_accessible_entrance: boolean | null;
  wheelchair_accessible_restroom: boolean | null;
  wheelchair_accessible_seating: boolean | null;
  outdoor_seating: boolean | null;
  has_restroom: boolean | null;
}

// Input validation
function validateRequest(body: unknown): { valid: true; data: DetailsRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  if (typeof data.place_id !== 'string' || data.place_id.length < 1 || data.place_id.length > 500) {
    return { valid: false, error: 'place_id must be a string between 1-500 characters' };
  }
  
  // Validate place_id format (Google place IDs start with ChIJ or similar patterns)
  if (!/^[A-Za-z0-9_-]+$/.test(data.place_id)) {
    return { valid: false, error: 'place_id contains invalid characters' };
  }
  
  const sessionToken = typeof data.sessionToken === 'string' && data.sessionToken.length < 200 
    ? data.sessionToken 
    : undefined;
  
  const includeReviews = typeof data.includeReviews === 'boolean' ? data.includeReviews : false;
  
  return {
    valid: true,
    data: {
      place_id: data.place_id,
      sessionToken,
      includeReviews,
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION: Require authenticated user ==========
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

    const { place_id, sessionToken, includeReviews } = validation.data;

    console.log(`Fetching details for place_id: ${place_id}, includeReviews: ${includeReviews}`);

    // Build field mask
    const fields = [
      "id",
      "displayName",
      "formattedAddress",
      "addressComponents",
      "location",
      "rating",
      "userRatingCount",
      "priceLevel",
      "websiteUri",
      "internationalPhoneNumber",
      "googleMapsUri",
      "regularOpeningHours",
      "photos",
      "primaryType",
      "primaryTypeDisplayName",
      "types",
      "businessStatus",
      "utcOffsetMinutes",
      // Amenity/accessibility fields
      "allowsDogs",
      "accessibilityOptions",
      "outdoorSeating",
      "restroom",
    ];
    
    if (includeReviews) {
      fields.push("reviews");
    }
    
    const fieldMask = fields.join(",");

    let url = `https://places.googleapis.com/v1/places/${place_id}?languageCode=en`;
    
    if (sessionToken) {
      url += `&sessionToken=${sessionToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google Places API error:", data.error.message);
      return new Response(
        JSON.stringify({ error: data.error.message || "Place not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse address components
    let city: string | null = null;
    let state: string | null = null;
    let country: string | null = null;
    let county: string | null = null; // For metro rollup logic

    for (const component of data.addressComponents || []) {
      const types = component.types || [];
      if (types.includes("locality")) {
        city = component.longText;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.shortText;
      } else if (types.includes("administrative_area_level_2")) {
        // County (e.g., "Collin County", "Dallas County")
        county = component.longText;
      } else if (types.includes("country")) {
        country = component.shortText;
      }
    }

    if (!city) {
      for (const component of data.addressComponents || []) {
        const types = component.types || [];
        if (types.includes("sublocality_level_1") || types.includes("postal_town")) {
          city = component.longText;
          break;
        }
      }
    }

    // Parse photos
    let photos: PhotoReference[] | null = null;
    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      photos = data.photos.slice(0, 5).map((photo: { name: string; widthPx?: number; heightPx?: number }) => ({
        name: photo.name,
        widthPx: photo.widthPx || 0,
        heightPx: photo.heightPx || 0,
      }));
    }

    // Parse opening hours
    let opening_hours: { weekday_text: string[] } | null = null;
    if (data.regularOpeningHours?.weekdayDescriptions) {
      opening_hours = {
        weekday_text: data.regularOpeningHours.weekdayDescriptions,
      };
    }

    // Map price level
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

    // Parse reviews
    let reviews: Review[] | undefined = undefined;
    if (includeReviews && data.reviews && Array.isArray(data.reviews)) {
      reviews = data.reviews.slice(0, 5).map((review: { text?: { text?: string }; originalText?: { text?: string }; rating?: number; relativePublishTimeDescription?: string }) => ({
        text: review.text?.text || review.originalText?.text || "",
        rating: review.rating ?? 0,
        relativePublishTimeDescription: review.relativePublishTimeDescription,
      }));
      console.log(`Parsed ${reviews!.length} reviews`);
    }

    const google_types: string[] = data.types || [];
    const business_status: string | null = data.businessStatus || null;
    const utc_offset_minutes: number | null = data.utcOffsetMinutes ?? null;

    // Parse amenity/accessibility fields
    const allows_dogs: boolean | null = data.allowsDogs ?? null;
    const outdoor_seating: boolean | null = data.outdoorSeating ?? null;
    const has_restroom: boolean | null = data.restroom ?? null;
    
    // Parse accessibility options (nested object)
    const accessibilityOptions = data.accessibilityOptions || {};
    const wheelchair_accessible_entrance: boolean | null = accessibilityOptions.wheelchairAccessibleEntrance ?? null;
    const wheelchair_accessible_restroom: boolean | null = accessibilityOptions.wheelchairAccessibleRestroom ?? null;
    const wheelchair_accessible_seating: boolean | null = accessibilityOptions.wheelchairAccessibleSeating ?? null;

    const details: PlaceDetails = {
      place_id: data.id || place_id,
      name: data.displayName?.text || "",
      formatted_address: data.formattedAddress || "",
      city,
      state,
      country,
      county,
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
      rating: data.rating ?? null,
      user_ratings_total: data.userRatingCount ?? null,
      price_level,
      website_url: data.websiteUri ?? null,
      phone_number: data.internationalPhoneNumber ?? null,
      google_maps_url: data.googleMapsUri ?? null,
      opening_hours,
      photos,
      google_primary_type: data.primaryType ?? null,
      google_primary_type_display: data.primaryTypeDisplayName?.text ?? null,
      google_types,
      business_status,
      utc_offset_minutes,
      reviews,
      raw_response: data,
      // Amenity/accessibility fields
      allows_dogs,
      wheelchair_accessible_entrance,
      wheelchair_accessible_restroom,
      wheelchair_accessible_seating,
      outdoor_seating,
      has_restroom,
    };

    console.log(`Returning details for: ${details.name}`);

    return new Response(
      JSON.stringify({ details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in google-places-details:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
