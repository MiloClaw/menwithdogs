import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  "(neighborhoods)": ["neighborhood", "sublocality", "sublocality_level_1", "locality"],
  // For "establishment", we don't restrict types - allows searching all venue types
};

serve(async (req) => {
  // Handle CORS preflight
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

    const { input, types = "(cities)", sessionToken, locationBias }: AutocompleteRequest = await req.json();

    if (!input || input.trim().length < 1) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Autocomplete request: input="${input}", types="${types}", sessionToken=${sessionToken ? "present" : "absent"}`);

    // Build request body for new API
    const requestBody: Record<string, unknown> = {
      input: input.trim(),
      languageCode: "en",
    };

    // Map legacy types to new format
    const includedTypes = TYPE_MAPPINGS[types];
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
          radius: locationBias.radius || 50000, // Default 50km
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
