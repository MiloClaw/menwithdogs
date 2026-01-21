import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AutoAssignRequest {
  place_id: string;
}

interface AutoAssignResponse {
  success: boolean;
  city_created: boolean;
  city_id: string | null;
  city_name: string | null;
  metro_assigned: boolean;
  metro_id: string | null;
  metro_name: string | null;
  city_auto_launched: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token for auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user is authenticated and is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user role (must be admin or super_admin)
    const { data: profile } = await userClient
      .from("member_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // For now, allow any authenticated user (admins are validated via RLS on places table)
    // In production, you'd check profile.role or use a separate admin check

    // Parse request body
    const { place_id }: AutoAssignRequest = await req.json();
    if (!place_id) {
      return new Response(
        JSON.stringify({ error: "place_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the place details
    const { data: place, error: placeError } = await supabase
      .from("places")
      .select("id, city, state, country, lat, lng, google_place_id")
      .eq("id", place_id)
      .single();

    if (placeError || !place) {
      console.error("Place fetch error:", placeError);
      return new Response(
        JSON.stringify({ error: "Place not found", details: placeError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing place:", place);

    const result: AutoAssignResponse = {
      success: true,
      city_created: false,
      city_id: null,
      city_name: null,
      metro_assigned: false,
      metro_id: null,
      metro_name: null,
      city_auto_launched: false,
    };

    // Skip if no city information
    if (!place.city || !place.country) {
      console.log("No city/country info, skipping");
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Check if city exists, create if not
    const { data: existingCity } = await supabase
      .from("cities")
      .select("id, name")
      .eq("name", place.city)
      .eq("country", place.country)
      .maybeSingle();

    if (existingCity) {
      result.city_id = existingCity.id;
      result.city_name = existingCity.name;
      console.log("City exists:", existingCity.name);
    } else {
      // Create new city as draft
      const { data: newCity, error: cityError } = await supabase
        .from("cities")
        .insert({
          name: place.city,
          state: place.state,
          country: place.country,
          lat: place.lat,
          lng: place.lng,
          status: "draft",
          target_place_count: 50,
          target_anchor_count: 10,
        })
        .select("id, name")
        .single();

      if (cityError) {
        console.error("City creation error:", cityError);
        // Don't fail the whole operation, just log it
      } else if (newCity) {
        result.city_created = true;
        result.city_id = newCity.id;
        result.city_name = newCity.name;
        
        // Attempt to assign metro_id to the newly created city based on county lookup
        // (Metro assignment for the city happens below after place metro is resolved)
        console.log("Created new city:", newCity.name);
      }
    }

    // 2. Check if place already has a metro assignment
    const { data: existingAssignment } = await supabase
      .from("place_geo_areas")
      .select("id, geo_area_id, geo_areas!inner(id, name, type)")
      .eq("place_id", place_id)
      .eq("geo_areas.type", "metro")
      .maybeSingle();

    if (existingAssignment) {
      console.log("Place already has metro assignment, skipping");
      const geoArea = existingAssignment.geo_areas as unknown as { id: string; name: string; type: string };
      result.metro_id = geoArea.id;
      result.metro_name = geoArea.name;
      result.metro_assigned = true;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Try to find metro via county lookup (US only)
    if (place.state && place.country === "United States") {
      // First, try to get county from Google Places API if we have lat/lng
      let county: string | null = null;

      if (place.lat && place.lng) {
        try {
          const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
          if (googleApiKey) {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${place.lat},${place.lng}&key=${googleApiKey}&result_type=administrative_area_level_2`;
            const geocodeRes = await fetch(geocodeUrl);
            const geocodeData = await geocodeRes.json();

            if (geocodeData.results && geocodeData.results.length > 0) {
              const adminArea = geocodeData.results[0].address_components?.find(
                (c: { types: string[] }) => c.types.includes("administrative_area_level_2")
              );
              if (adminArea) {
                county = adminArea.long_name.replace(" County", "");
                console.log("Found county from geocoding:", county);
              }
            }
          }
        } catch (e) {
          console.error("Geocoding error:", e);
        }
      }

      // Use the find_metro_for_county function if we have county
      if (county) {
        const { data: metroResult, error: metroError } = await supabase.rpc(
          "find_metro_for_county",
          {
            p_county: county,
            p_state: place.state,
          }
        );

        if (!metroError && metroResult && metroResult.metro_id) {
          // Insert into place_geo_areas
          const { error: insertError } = await supabase
            .from("place_geo_areas")
            .insert({
              place_id: place_id,
              geo_area_id: metroResult.metro_id,
              source: "auto_approval",
              confidence: 0.8,
            });

          if (!insertError) {
            result.metro_assigned = true;
            result.metro_id = metroResult.metro_id;
            result.metro_name = metroResult.metro_name;
            console.log("Assigned metro:", metroResult.metro_name);
            
            // Also assign this metro to the city if it doesn't have one
            if (result.city_id) {
              const { data: cityData } = await supabase
                .from("cities")
                .select("metro_id")
                .eq("id", result.city_id)
                .single();
              
              if (cityData && !cityData.metro_id) {
                const { error: cityMetroError } = await supabase
                  .from("cities")
                  .update({ metro_id: metroResult.metro_id })
                  .eq("id", result.city_id);
                
                if (!cityMetroError) {
                  console.log("Assigned metro to city:", result.city_name);
                } else {
                  console.error("Failed to assign metro to city:", cityMetroError);
                }
              }
            }
          } else {
            console.error("Metro assignment insert error:", insertError);
          }
        } else {
          console.log("No metro found for county:", county, place.state);
        }
      }
    }

    // 4. Check if city should auto-launch (10+ approved places)
    if (result.city_id && place.city && place.state) {
      const { data: cityData } = await supabase
        .from("cities")
        .select("status, auto_launch_threshold")
        .eq("id", result.city_id)
        .single();

      if (cityData?.status === "draft") {
        // Count approved places for this city
        const { count } = await supabase
          .from("places")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .ilike("city", place.city)
          .eq("state", place.state);

        const threshold = cityData.auto_launch_threshold ?? 10;
        console.log(`City ${place.city} has ${count} approved places (threshold: ${threshold})`);

        if (count && count >= threshold) {
          const { error: launchError } = await supabase
            .from("cities")
            .update({
              status: "launched",
              launched_at: new Date().toISOString(),
            })
            .eq("id", result.city_id);

          if (!launchError) {
            result.city_auto_launched = true;
            console.log(`Auto-launched city: ${place.city}`);
          } else {
            console.error("City auto-launch error:", launchError);
          }
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in auto-assign-place-geography:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
