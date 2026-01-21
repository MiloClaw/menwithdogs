import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BackfillRequest {
  batch_size?: number;
  dry_run?: boolean;
}

interface AssignmentResult {
  place_id: string;
  place_name: string;
  city: string;
  state: string;
  metro_name: string | null;
  status: "assigned" | "skipped_no_coords" | "skipped_no_county" | "skipped_no_metro" | "error";
  error?: string;
}

interface BackfillResponse {
  success: boolean;
  dry_run: boolean;
  batch_size: number;
  processed: number;
  assigned: number;
  skipped_no_coords: number;
  skipped_no_county: number;
  skipped_no_metro: number;
  errors: number;
  remaining: number;
  assignments: AssignmentResult[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

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

    // Check admin role
    const { data: hasAdminRole } = await userClient.rpc("has_role", { 
      _user_id: user.id, 
      _role: "admin" 
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body = await req.json().catch(() => ({}));
    const { batch_size = 30, dry_run = false }: BackfillRequest = body;

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find approved places missing metro assignments
    const { data: placesNeedingMetro, error: queryError } = await supabase
      .from("places")
      .select(`
        id,
        name,
        city,
        state,
        country,
        lat,
        lng
      `)
      .eq("status", "approved")
      .in("country", ["United States", "US", "USA"])
      .not("lat", "is", null)
      .not("lng", "is", null)
      .not("state", "is", null)
      .limit(batch_size);

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query places", details: queryError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to only places without metro assignments
    const placesWithoutMetro: typeof placesNeedingMetro = [];
    for (const place of placesNeedingMetro || []) {
      const { data: existingAssignment } = await supabase
        .from("place_geo_areas")
        .select("id, geo_areas!inner(type)")
        .eq("place_id", place.id)
        .eq("geo_areas.type", "metro")
        .maybeSingle();

      if (!existingAssignment) {
        placesWithoutMetro.push(place);
      }
    }

    // Count total remaining (approximate)
    const { count: totalApproved } = await supabase
      .from("places")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("country", "United States");

    const { count: totalWithMetro } = await supabase
      .from("place_geo_areas")
      .select("id", { count: "exact", head: true })
      .not("geo_area_id", "is", null);

    const estimatedRemaining = Math.max(0, (totalApproved || 0) - (totalWithMetro || 0) - placesWithoutMetro.length);

    console.log(`Processing ${placesWithoutMetro.length} places (batch_size: ${batch_size}, dry_run: ${dry_run})`);

    const results: AssignmentResult[] = [];
    let assigned = 0;
    let skippedNoCoords = 0;
    let skippedNoCounty = 0;
    let skippedNoMetro = 0;
    let errors = 0;

    for (const place of placesWithoutMetro) {
      const result: AssignmentResult = {
        place_id: place.id,
        place_name: place.name,
        city: place.city || "",
        state: place.state || "",
        metro_name: null,
        status: "skipped_no_coords",
      };

      try {
        if (!place.lat || !place.lng) {
          skippedNoCoords++;
          results.push(result);
          continue;
        }

        // Get county from Google Geocoding API
        let county: string | null = null;
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
            }
          }
        }

        if (!county) {
          result.status = "skipped_no_county";
          skippedNoCounty++;
          results.push(result);
          console.log(`No county found for ${place.name} (${place.city}, ${place.state})`);
          continue;
        }

        console.log(`Found county "${county}" for ${place.name}`);

        // Find metro for this county
        const { data: metroResult, error: metroError } = await supabase.rpc(
          "find_metro_for_county",
          {
            _county_name: county,
            _state_code: place.state,
            _country_code: "US",
          }
        );

        if (metroError || !metroResult || metroResult.length === 0) {
          result.status = "skipped_no_metro";
          skippedNoMetro++;
          results.push(result);
          console.log(`No metro found for county "${county}", ${place.state}`);
          continue;
        }

        const metro = metroResult[0];
        result.metro_name = metro.metro_name;

        if (dry_run) {
          result.status = "assigned";
          assigned++;
          results.push(result);
          console.log(`[DRY RUN] Would assign ${place.name} to ${metro.metro_name}`);
          continue;
        }

        // Insert metro assignment
        const { error: insertError } = await supabase
          .from("place_geo_areas")
          .insert({
            place_id: place.id,
            geo_area_id: metro.metro_id,
            source: "backfill",
            confidence: 0.8,
          });

        if (insertError) {
          result.status = "error";
          result.error = insertError.message;
          errors++;
          console.error(`Failed to assign ${place.name}: ${insertError.message}`);
        } else {
          result.status = "assigned";
          assigned++;
          console.log(`Assigned ${place.name} to ${metro.metro_name}`);
        }

        results.push(result);
      } catch (err) {
        result.status = "error";
        result.error = err instanceof Error ? err.message : "Unknown error";
        errors++;
        results.push(result);
        console.error(`Error processing ${place.name}:`, err);
      }
    }

    const response: BackfillResponse = {
      success: true,
      dry_run,
      batch_size,
      processed: placesWithoutMetro.length,
      assigned,
      skipped_no_coords: skippedNoCoords,
      skipped_no_county: skippedNoCounty,
      skipped_no_metro: skippedNoMetro,
      errors,
      remaining: estimatedRemaining,
      assignments: results,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
