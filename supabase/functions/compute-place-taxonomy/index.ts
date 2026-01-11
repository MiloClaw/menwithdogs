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

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Input validation
function validateRequest(body: unknown): { valid: true; data: TaxonomyRequest } | { valid: false; error: string } {
  if (body === null || body === undefined) {
    return { valid: true, data: {} };
  }
  
  if (typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  const result: TaxonomyRequest = {};
  
  if (data.place_id !== undefined) {
    if (typeof data.place_id !== 'string' || !UUID_REGEX.test(data.place_id)) {
      return { valid: false, error: 'place_id must be a valid UUID' };
    }
    result.place_id = data.place_id;
  }
  
  if (data.city !== undefined) {
    if (typeof data.city !== 'string' || data.city.length < 1 || data.city.length > 200) {
      return { valid: false, error: 'city must be a string between 1-200 characters' };
    }
    result.city = data.city;
  }
  
  if (data.recompute_all !== undefined) {
    if (typeof data.recompute_all !== 'boolean') {
      return { valid: false, error: 'recompute_all must be a boolean' };
    }
    result.recompute_all = data.recompute_all;
  }
  
  return { valid: true, data: result };
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

    // Validate input
    const rawBody = await req.json().catch(() => null);
    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { place_id, city, recompute_all } = validation.data;

    console.log(`Admin ${userId} computing taxonomy: place_id=${place_id}, city=${city}, recompute_all=${recompute_all}`);

    const result: TaxonomyResult = {
      processed_count: 0,
      assignments_count: 0,
      errors: []
    };

    // Fetch active google_type_mappings
    const { data: mappings, error: mappingsError } = await supabaseAdmin
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
    let placesQuery = supabaseAdmin
      .from("places")
      .select("id, google_types")
      .eq("is_active", true);

    if (place_id) {
      placesQuery = placesQuery.eq("id", place_id);
    } else if (city) {
      placesQuery = placesQuery.eq("city", city);
    }

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

        const nodeConfidences: Record<string, number> = {};
        
        for (const gType of googleTypes) {
          const nodeAssignments = typeToNodes[gType];
          if (nodeAssignments) {
            for (const assignment of nodeAssignments) {
              const currentConfidence = nodeConfidences[assignment.taxonomy_node_id] || 0;
              nodeConfidences[assignment.taxonomy_node_id] = Math.max(currentConfidence, assignment.weight);
            }
          }
        }

        await supabaseAdmin
          .from("place_taxonomy")
          .delete()
          .eq("place_id", place.id)
          .eq("source", "google_type_map");

        const assignments = Object.entries(nodeConfidences).map(([taxonomy_node_id, confidence]) => ({
          place_id: place.id,
          taxonomy_node_id,
          confidence,
          source: "google_type_map" as const,
          computed_at: new Date().toISOString()
        }));

        if (assignments.length > 0) {
          const { error: insertError } = await supabaseAdmin
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
