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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      city_name, 
      lat, 
      lng, 
      radius_meters = 5000, 
      google_types,
      max_results_per_type = 20 
    }: SeedRequest = await req.json();

    if (!city_name || !lat || !lng || !google_types?.length) {
      return new Response(
        JSON.stringify({ error: "city_name, lat, lng, and google_types are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Seeding places for ${city_name} at (${lat}, ${lng}) with radius ${radius_meters}m`);
    console.log(`Google types to search: ${google_types.join(", ")}`);

    const result: SeedResult = {
      imported_count: 0,
      skipped_count: 0,
      errors: [],
      places: []
    };

    // Fetch existing google_place_ids to avoid duplicates
    const { data: existingPlaces } = await supabase
      .from("places")
      .select("google_place_id");
    
    const existingIds = new Set((existingPlaces || []).map(p => p.google_place_id));

    // Search for each Google type
    for (const googleType of google_types) {
      try {
        console.log(`Searching for type: ${googleType}`);
        
        // Use Google Places API (New) Nearby Search
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
          
          // Skip if already exists
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
          existingIds.add(placeId); // Track to avoid duplicates within this batch
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
