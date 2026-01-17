import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RECORD-FOUNDERS-REDEMPTION] ${step}${detailsStr}`);
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
    const { city_id } = await req.json();
    if (!city_id) throw new Error("city_id is required");
    logStep("Request parsed", { city_id });

    // Check if already recorded
    const { data: existingRedemption } = await supabaseClient
      .from("founders_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingRedemption) {
      logStep("Redemption already recorded");
      return new Response(
        JSON.stringify({ success: true, message: "Already recorded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Initialize Stripe and verify active subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer and verify subscription
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscription with founders price
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    const foundersSubscription = subscriptions.data.find((sub: Stripe.Subscription) => 
      sub.items.data.some((item: Stripe.SubscriptionItem) => item.price.id === FOUNDERS_PRICE_ID)
    );

    if (!foundersSubscription) {
      // Also check trialing status (3 months free)
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });
      
      const trialingFounders = trialingSubscriptions.data.find((sub: Stripe.Subscription) => 
        sub.items.data.some((item: Stripe.SubscriptionItem) => item.price.id === FOUNDERS_PRICE_ID)
      );
      
      if (!trialingFounders) {
        throw new Error("No active founders subscription found");
      }
      
      logStep("Found trialing founders subscription", { subscriptionId: trialingFounders.id });
    } else {
      logStep("Found active founders subscription", { subscriptionId: foundersSubscription.id });
    }

    const activeSubscription = foundersSubscription || subscriptions.data[0];

    // Get user's couple_id
    const { data: memberProfile } = await supabaseClient
      .from("member_profiles")
      .select("couple_id")
      .eq("user_id", user.id)
      .eq("is_owner", true)
      .single();

    // Get city's promo code id
    const { data: city } = await supabaseClient
      .from("cities")
      .select("founders_promo_code_id")
      .eq("id", city_id)
      .single();

    // Record the redemption
    const { error: insertError } = await supabaseClient
      .from("founders_redemptions")
      .insert({
        user_id: user.id,
        city_id: city_id,
        couple_id: memberProfile?.couple_id || null,
        stripe_subscription_id: activeSubscription?.id || null,
        stripe_promo_code_id: city?.founders_promo_code_id || null,
      });

    if (insertError) {
      logStep("ERROR inserting redemption", { error: insertError.message });
      throw new Error(`Failed to record redemption: ${insertError.message}`);
    }
    logStep("Redemption recorded successfully");

    // Increment city's founders_slots_used
    const { error: updateError } = await supabaseClient.rpc('increment_founders_slots', { 
      _city_id: city_id 
    }).single();

    // If RPC doesn't exist, do manual update
    if (updateError) {
      const { error: manualUpdateError } = await supabaseClient
        .from("cities")
        .update({ 
          founders_slots_used: supabaseClient.rpc('coalesce', { value: 'founders_slots_used', default_value: 0 }) 
        })
        .eq("id", city_id);
      
      // Simple increment as fallback
      const { data: currentCity } = await supabaseClient
        .from("cities")
        .select("founders_slots_used")
        .eq("id", city_id)
        .single();
      
      await supabaseClient
        .from("cities")
        .update({ founders_slots_used: (currentCity?.founders_slots_used || 0) + 1 })
        .eq("id", city_id);
    }
    logStep("City slots updated");

    return new Response(
      JSON.stringify({ success: true }),
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
