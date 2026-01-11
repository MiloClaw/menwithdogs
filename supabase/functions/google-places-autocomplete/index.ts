import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutocompleteRequest {
  input: string;
  types?: string; // Legacy format: "(cities)" or "establishment"
  sessionToken?: string;
  locationBias?: {
    lat: number;
    lng: number;
    radius?: number;
  };
}

// Map legacy type strings to new API format (max 5 types per API limitation)
const TYPE_MAPPINGS: Record<string, string[]> = {
  "(cities)": ["locality", "administrative_area_level_3", "postal_town", "sublocality_level_1"],
  "(neighborhoods)": ["neighborhood", "sublocality", "sublocality_level_1", "sublocality_level_2"],
  // For "establishment", we don't restrict types - allows searching all venue types
};

// Input validation
function validateRequest(body: unknown): { valid: true; data: AutocompleteRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  if (typeof data.input !== 'string' || data.input.trim().length < 1) {
    return { valid: true, data: { input: '', types: '(cities)' } }; // Return empty predictions
  }
  
  if (data.input.length > 500) {
    return { valid: false, error: 'input must be under 500 characters' };
  }
  
  const types = typeof data.types === 'string' ? data.types : '(cities)';
  if (types.length > 100) {
    return { valid: false, error: 'types must be under 100 characters' };
  }
  
  const sessionToken = typeof data.sessionToken === 'string' && data.sessionToken.length < 200 
    ? data.sessionToken 
    : undefined;
  
  let locationBias: AutocompleteRequest['locationBias'] = undefined;
  if (data.locationBias && typeof data.locationBias === 'object') {
    const lb = data.locationBias as Record<string, unknown>;
    if (typeof lb.lat === 'number' && typeof lb.lng === 'number') {
      if (lb.lat >= -90 && lb.lat <= 90 && lb.lng >= -180 && lb.lng <= 180) {
        locationBias = {
          lat: lb.lat,
          lng: lb.lng,
          radius: typeof lb.radius === 'number' ? Math.min(Math.max(lb.radius, 1000), 100000) : 50000,
        };
      }
    }
  }
  
  return {
    valid: true,
    data: {
      input: data.input.trim(),
      types,
      sessionToken,
      locationBias,
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

    const { input, types, sessionToken, locationBias } = validation.data;

    if (!input) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Autocomplete request: input="${input}", types="${types}", sessionToken=${sessionToken ? "present" : "absent"}`);

    // Build request body for new API
    const requestBody: Record<string, unknown> = {
      input,
      languageCode: "en",
    };

    // Map legacy types to new format
    const includedTypes = TYPE_MAPPINGS[types || "(cities)"];
    if (includedTypes) {
      requestBody.includedPrimaryTypes = includedTypes;
    }

    // Add session token if provided
    if (sessionToken) {
      requestBody.sessionToken = sessionToken;
    }

    // Add location bias if provided
    if (locationBias) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: locationBias.lat,
            longitude: locationBias.lng,
          },
          radius: locationBias.radius || 50000,
        },
      };
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Google Places API error:", data.error.message);
      return new Response(
        JSON.stringify({ error: data.error.message || "Google API error" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform new API response to match legacy format
    const predictions = (data.suggestions || [])
      .filter((s: { placePrediction?: unknown }) => s.placePrediction)
      .map((s: { placePrediction: {
        placeId: string;
        text?: { text: string };
        structuredFormat?: {
          mainText?: { text: string };
          secondaryText?: { text: string };
        };
      }}) => {
        const p = s.placePrediction;
        return {
          place_id: p.placeId,
          description: p.text?.text || "",
          structured_formatting: p.structuredFormat ? {
            main_text: p.structuredFormat.mainText?.text || "",
            secondary_text: p.structuredFormat.secondaryText?.text || "",
          } : undefined,
        };
      });

    console.log(`Returning ${predictions.length} predictions`);

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in google-places-autocomplete:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
