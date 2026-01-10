import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PlaceSubmission {
  place_id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  website_url?: string;
  phone_number?: string;
  google_maps_url?: string;
  opening_hours?: Record<string, unknown>;
  google_primary_type?: string;
  google_primary_type_display?: string;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  price_level?: number;
  google_types?: string[];
  business_status?: string;
  utc_offset_minutes?: number;
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

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const details: PlaceSubmission = await req.json();

    if (!details.place_id || !details.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: place_id, name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if place already exists (by google_place_id)
    const { data: existingPlace } = await supabase
      .from("places")
      .select("id, status")
      .eq("google_place_id", details.place_id)
      .maybeSingle();

    if (existingPlace) {
      const statusMessage = existingPlace.status === "approved" 
        ? "This place is already in our directory."
        : "This place has already been suggested and is pending review.";
      
      return new Response(
        JSON.stringify({ 
          error: "duplicate", 
          message: statusMessage,
          existingId: existingPlace.id 
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for insert to bypass RLS select restriction
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare insert data
    const insertData = {
      google_place_id: details.place_id,
      name: details.name,
      primary_category: details.google_primary_type_display || "Uncategorized",
      city: details.city || null,
      state: details.state || null,
      country: details.country || null,
      lat: details.lat || null,
      lng: details.lng || null,
      source: "user_submitted",
      status: "pending",
      submitted_by: user.id,
      // GBP enrichment fields
      rating: details.rating || null,
      user_ratings_total: details.user_ratings_total || null,
      formatted_address: details.formatted_address || null,
      website_url: details.website_url || null,
      phone_number: details.phone_number || null,
      google_maps_url: details.google_maps_url || null,
      opening_hours: details.opening_hours || null,
      google_primary_type: details.google_primary_type || null,
      google_primary_type_display: details.google_primary_type_display || null,
      photos: details.photos || null,
      price_level: details.price_level || null,
      google_types: details.google_types || null,
      business_status: details.business_status || null,
      utc_offset_minutes: details.utc_offset_minutes || null,
      // Track data freshness
      last_fetched_at: new Date().toISOString(),
      fetch_version: 1,
    };

    // Insert the place
    const { data: insertedPlace, error: insertError } = await supabaseAdmin
      .from("places")
      .insert(insertData)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      
      // Handle unique constraint violation gracefully
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ 
            error: "duplicate", 
            message: "This place has already been suggested." 
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to submit suggestion", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger photo storage in background (fire-and-forget)
    if (insertedPlace?.id && details.photos && details.photos.length > 0) {
      // Don't await - let it run in background
      supabaseAdmin.functions.invoke("store-place-photos", {
        body: {
          placeId: insertedPlace.id,
          photos: details.photos.slice(0, 5),
          maxWidth: 800,
          maxHeight: 600,
        },
      }).catch((err) => {
        console.warn("Photo storage failed (non-blocking):", err);
      });
    }

    console.log(`Place suggestion submitted: ${insertedPlace.id} by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        placeId: insertedPlace.id,
        message: "Thanks for your suggestion! Our team will review it shortly."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
