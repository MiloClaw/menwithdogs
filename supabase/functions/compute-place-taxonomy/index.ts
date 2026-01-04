import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaxonomyRequest {
  place_id?: string;
  city?: string;
  recompute_all?: boolean;
}

interface TaxonomyResult {
  processed_count: number;
  assignments_count: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { place_id, city, recompute_all }: TaxonomyRequest = await req.json().catch(() => ({}));

    console.log(`Computing taxonomy: place_id=${place_id}, city=${city}, recompute_all=${recompute_all}`);

    const result: TaxonomyResult = {
      processed_count: 0,
      assignments_count: 0,
      errors: []
    };

    // Fetch active google_type_mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from("google_type_mappings")
      .select("google_type, taxonomy_node_id, weight")
      .eq("is_active", true);

    if (mappingsError || !mappings || mappings.length === 0) {
      console.log("No active mappings found, skipping taxonomy computation");
      return new Response(
        JSON.stringify({ ...result, message: "No active mappings configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build lookup: google_type -> [{taxonomy_node_id, weight}]
    const typeToNodes: Record<string, Array<{taxonomy_node_id: string, weight: number}>> = {};
    for (const mapping of mappings) {
      if (!typeToNodes[mapping.google_type]) {
        typeToNodes[mapping.google_type] = [];
      }
      typeToNodes[mapping.google_type].push({
        taxonomy_node_id: mapping.taxonomy_node_id,
        weight: mapping.weight
      });
    }

    console.log(`Loaded ${mappings.length} mappings for ${Object.keys(typeToNodes).length} Google types`);

    // Build places query
    let placesQuery = supabase
      .from("places")
      .select("id, google_types")
      .eq("is_active", true);

    if (place_id) {
      placesQuery = placesQuery.eq("id", place_id);
    } else if (city) {
      placesQuery = placesQuery.eq("city", city);
    }

    // Limit if recomputing all to avoid timeout
    if (recompute_all) {
      placesQuery = placesQuery.limit(500);
    }

    const { data: places, error: placesError } = await placesQuery;

    if (placesError) {
      console.error("Error fetching places:", placesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch places" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!places || places.length === 0) {
      console.log("No places found to process");
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${places.length} places`);

    for (const place of places) {
      try {
        const googleTypes: string[] = place.google_types || [];
        
        if (googleTypes.length === 0) {
          result.processed_count++;
          continue;
        }

        // Calculate taxonomy assignments with weighted confidence
        const nodeConfidences: Record<string, number> = {};
        
        for (const gType of googleTypes) {
          const nodeAssignments = typeToNodes[gType];
          if (nodeAssignments) {
            for (const assignment of nodeAssignments) {
              const currentConfidence = nodeConfidences[assignment.taxonomy_node_id] || 0;
              // Use max weight if same node mapped multiple times
              nodeConfidences[assignment.taxonomy_node_id] = Math.max(currentConfidence, assignment.weight);
            }
          }
        }

        // Delete existing google_type_map assignments for this place
        await supabase
          .from("place_taxonomy")
          .delete()
          .eq("place_id", place.id)
          .eq("source", "google_type_map");

        // Insert new assignments
        const assignments = Object.entries(nodeConfidences).map(([taxonomy_node_id, confidence]) => ({
          place_id: place.id,
          taxonomy_node_id,
          confidence,
          source: "google_type_map" as const,
          computed_at: new Date().toISOString()
        }));

        if (assignments.length > 0) {
          const { error: insertError } = await supabase
            .from("place_taxonomy")
            .upsert(assignments, { onConflict: "place_id,taxonomy_node_id" });

          if (insertError) {
            console.error(`Error inserting taxonomy for ${place.id}:`, insertError);
            result.errors.push(`${place.id}: ${insertError.message}`);
          } else {
            result.assignments_count += assignments.length;
          }
        }

        result.processed_count++;
      } catch (placeError) {
        console.error(`Error processing place ${place.id}:`, placeError);
        result.errors.push(`${place.id}: ${String(placeError)}`);
      }
    }

    console.log(`Taxonomy computation complete: ${result.processed_count} places, ${result.assignments_count} assignments`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in compute-place-taxonomy:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
