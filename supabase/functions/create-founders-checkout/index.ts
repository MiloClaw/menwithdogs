import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FOUNDERS-CHECKOUT] ${step}${detailsStr}`);
};

// Founders price: $2.99/month
const FOUNDERS_PRICE_ID = "price_1SqamZ3Z5TtwrbktuLF44MKO";

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { city_id, couple_id } = await req.json();
    if (!city_id) throw new Error("city_id is required");
    logStep("Request parsed", { city_id, couple_id });

    // Check if user already has a founders redemption
    const { data: existingRedemption } = await supabaseClient
      .from("founders_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingRedemption) {
      logStep("User already has founders redemption");
      return new Response(
        JSON.stringify({ error: "You have already claimed a founders offer" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get city's promo code
    const { data: city, error: cityError } = await supabaseClient
      .from("cities")
      .select("id, name, founders_promo_code_id, founders_slots_total, founders_slots_used")
      .eq("id", city_id)
      .eq("status", "launched")
      .single();

    if (cityError || !city) {
      logStep("City not found or not launched", { error: cityError?.message });
      throw new Error("City not found or not launched");
    }

    if (!city.founders_promo_code_id) {
      logStep("No founders promo code for city");
      throw new Error("Founders offer not available for this city");
    }

    // Check if slots are available
    const slotsRemaining = (city.founders_slots_total || 100) - (city.founders_slots_used || 0);
    if (slotsRemaining <= 0) {
      logStep("No founders slots remaining", { city: city.name });
      return new Response(
        JSON.stringify({ error: "All founders spots have been claimed for this city" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    logStep("Founders slots available", { remaining: slotsRemaining });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://thicktimber.com";

    // Create Stripe checkout session with founders pricing and promo code
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: FOUNDERS_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      discounts: [
        {
          promotion_code: city.founders_promo_code_id,
        },
      ],
      success_url: `${origin}/settings?tab=account&subscription=success&founders=true&city_id=${city_id}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        couple_id: couple_id || "",
        city_id: city_id,
        is_founders: "true",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          couple_id: couple_id || "",
          city_id: city_id,
          is_founders: "true",
        },
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
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
