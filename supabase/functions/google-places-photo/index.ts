import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Parse request - supports both GET with query params and POST with body
    let photoName: string | null = null;
    let maxWidth: number = 400;
    let maxHeight: number = 400;

    if (req.method === "GET") {
      const url = new URL(req.url);
      photoName = url.searchParams.get("name");
      const widthParam = url.searchParams.get("maxWidth");
      const heightParam = url.searchParams.get("maxHeight");
      if (widthParam) maxWidth = parseInt(widthParam, 10) || 400;
      if (heightParam) maxHeight = parseInt(heightParam, 10) || 400;
    } else if (req.method === "POST") {
      const body = await req.json();
      photoName = body.name;
      if (body.maxWidth) maxWidth = body.maxWidth;
      if (body.maxHeight) maxHeight = body.maxHeight;
    }

    if (!photoName) {
      return new Response(
        JSON.stringify({ error: "Photo name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate photo name format (should be like "places/xxx/photos/yyy")
    if (!photoName.startsWith("places/") || !photoName.includes("/photos/")) {
      console.error("Invalid photo name format:", photoName);
      return new Response(
        JSON.stringify({ error: "Invalid photo name format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clamp dimensions to reasonable limits
    maxWidth = Math.min(Math.max(maxWidth, 100), 4800);
    maxHeight = Math.min(Math.max(maxHeight, 100), 4800);

    console.log(`Fetching photo: ${photoName} (${maxWidth}x${maxHeight})`);

    // Fetch the photo from Google Places API
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;
    
    const response = await fetch(photoUrl, {
      method: "GET",
      headers: {
        "Accept": "image/*",
      },
    });

    if (!response.ok) {
      console.error(`Google Places photo error: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch photo" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/jpeg";

    console.log(`Returning photo: ${contentType}, ${imageData.byteLength} bytes`);

    // Convert to base64 data URL for JSON response
    const uint8Array = new Uint8Array(imageData);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Return JSON with data URL
    return new Response(
      JSON.stringify({ url: dataUrl }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
        },
      }
    );
  } catch (error) {
    console.error("Error in google-places-photo:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
