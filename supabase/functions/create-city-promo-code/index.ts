import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CITY-PROMO-CODE] ${step}${detailsStr}`);
};

// Master coupon ID for 3 months free
const MASTER_COUPON_ID = "Sg7md4vM";
const DEFAULT_MAX_REDEMPTIONS = 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    // Check admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    if (!roleData) throw new Error("Admin access required");
    logStep("Admin verified", { userId });

    // Parse request body
    const { city_id, city_name, max_redemptions = DEFAULT_MAX_REDEMPTIONS } = await req.json();
    if (!city_id || !city_name) {
      throw new Error("city_id and city_name are required");
    }
    logStep("Request parsed", { city_id, city_name, max_redemptions });

    // Generate promo code from city name
    const sanitizedName = city_name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 20);
    const promoCodeString = `${sanitizedName}-FOUNDERS`;
    logStep("Generated promo code string", { promoCodeString });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if promo code already exists for this city
    const { data: existingCity } = await supabaseClient
      .from("cities")
      .select("founders_promo_code_id")
      .eq("id", city_id)
      .single();

    if (existingCity?.founders_promo_code_id) {
      logStep("Promo code already exists for city", { city_id });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Promo code already exists",
          promo_code: existingCity.founders_promo_code_id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create Stripe promotion code
    const promotionCode = await stripe.promotionCodes.create({
      coupon: MASTER_COUPON_ID,
      code: promoCodeString,
      max_redemptions: max_redemptions,
      metadata: {
        city_id,
        city_name,
        type: "founders",
      },
    });
    logStep("Stripe promotion code created", { 
      promotionCodeId: promotionCode.id, 
      code: promotionCode.code 
    });

    // Update city record with promo code details
    const { error: updateError } = await supabaseClient
      .from("cities")
      .update({
        founders_promo_code: promotionCode.code,
        founders_promo_code_id: promotionCode.id,
        founders_slots_total: max_redemptions,
        founders_slots_used: 0,
      })
      .eq("id", city_id);

    if (updateError) {
      logStep("ERROR updating city record", { error: updateError.message });
      throw new Error(`Failed to update city: ${updateError.message}`);
    }
    logStep("City record updated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        promo_code: promotionCode.code,
        promo_code_id: promotionCode.id,
        max_redemptions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
