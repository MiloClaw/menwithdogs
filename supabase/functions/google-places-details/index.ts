import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DetailsRequest {
  place_id: string;
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

    const { place_id }: DetailsRequest = await req.json();

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: "place_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching details for place_id: ${place_id}`);

    const params = new URLSearchParams({
      place_id,
      key: apiKey,
      fields: "place_id,name,formatted_address,address_components,geometry",
      language: "en",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || "Place not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data.result;
    
    // Parse address components
    let city: string | null = null;
    let state: string | null = null;
    let country: string | null = null;

    for (const component of result.address_components || []) {
      const types = component.types || [];
      if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      } else if (types.includes("country")) {
        country = component.short_name;
      }
    }

    // If no locality, try sublocality or administrative_area_level_2
    if (!city) {
      for (const component of result.address_components || []) {
        const types = component.types || [];
        if (types.includes("sublocality_level_1") || types.includes("administrative_area_level_2")) {
          city = component.long_name;
          break;
        }
      }
    }

    const details: PlaceDetails = {
      place_id: result.place_id,
      name: result.name,
      formatted_address: result.formatted_address,
      city,
      state,
      country,
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
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
