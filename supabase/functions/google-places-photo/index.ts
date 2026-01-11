import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      const body = await req.json().catch(() => ({}));
      photoName = typeof body.name === 'string' ? body.name : null;
      if (typeof body.maxWidth === 'number') maxWidth = body.maxWidth;
      if (typeof body.maxHeight === 'number') maxHeight = body.maxHeight;
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

    // Validate photo name doesn't contain path traversal
    if (photoName.includes("..") || photoName.includes("//")) {
      return new Response(
        JSON.stringify({ error: "Invalid photo name" }),
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
      return new Response(
        JSON.stringify({ error: "Failed to fetch photo" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/jpeg";

    console.log(`Returning photo: ${contentType}, ${imageData.byteLength} bytes`);

    // For GET requests, return raw binary (for direct img src use)
    // For POST requests, return JSON with base64 data URL (for SDK invoke use)
    if (req.method === "GET") {
      return new Response(imageData, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
        },
      });
    }

    // POST: Convert to base64 data URL for JSON response
    const uint8Array = new Uint8Array(imageData);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    const dataUrl = `data:${contentType};base64,${base64}`;

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
