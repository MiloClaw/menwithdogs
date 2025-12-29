import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DetailsRequest {
  place_id: string;
  sessionToken?: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

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

    const { place_id, sessionToken }: DetailsRequest = await req.json();

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: "place_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching details for place_id: ${place_id}`);

    // Build URL with field mask
    const fieldMask = "id,displayName,formattedAddress,addressComponents,location";
    let url = `https://places.googleapis.com/v1/places/${place_id}?languageCode=en`;
    
    // Add session token if provided (completes the billing session)
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

    // Parse address components (new API format)
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

    // Fallback for city if no locality found
    if (!city) {
      for (const component of data.addressComponents || []) {
        const types = component.types || [];
        if (types.includes("sublocality_level_1") || types.includes("administrative_area_level_2") || types.includes("postal_town")) {
          city = component.longText;
          break;
        }
      }
    }

    const details: PlaceDetails = {
      place_id: data.id || place_id,
      name: data.displayName?.text || "",
      formatted_address: data.formattedAddress || "",
      city,
      state,
      country,
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
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
