import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MetroCheckRequest {
  county: string;
  state: string;
  country?: string;
}

interface MetroCheckResponse {
  inMetro: boolean;
  metroName?: string;
  primaryCity?: string;
  primaryState?: string;
  metroLat?: number;
  metroLng?: number;
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

    const body = await req.json().catch(() => null);
    
    if (!body || typeof body.county !== 'string' || typeof body.state !== 'string') {
      return new Response(
        JSON.stringify({ error: "county and state are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { county, state, country = 'US' }: MetroCheckRequest = body;

    console.log(`Checking metro membership for county: ${county}, state: ${state}, country: ${country}`);

    // Call the find_metro_for_county function
    const { data, error } = await supabase
      .rpc('find_metro_for_county', {
        _county_name: county,
        _state_code: state,
        _country_code: country,
      });

    if (error) {
      console.error('Error calling find_metro_for_county:', error);
      return new Response(
        JSON.stringify({ inMetro: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data || data.length === 0) {
      console.log(`No metro found for ${county}, ${state}`);
      return new Response(
        JSON.stringify({ inMetro: false } as MetroCheckResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metroData = data[0];
    console.log(`Found metro: ${metroData.metro_name}, primary city: ${metroData.primary_city_name}`);

    const response: MetroCheckResponse = {
      inMetro: true,
      metroName: metroData.metro_name,
      primaryCity: metroData.primary_city_name,
      primaryState: metroData.primary_city_state,
      metroLat: metroData.metro_lat ? Number(metroData.metro_lat) : undefined,
      metroLng: metroData.metro_lng ? Number(metroData.metro_lng) : undefined,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-metro-membership:", error);
    return new Response(
      JSON.stringify({ inMetro: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
