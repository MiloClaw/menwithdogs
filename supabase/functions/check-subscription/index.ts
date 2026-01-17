import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Founders price ID for detection
const FOUNDERS_PRICE_ID = "price_1SqamZ3Z5TtwrbktuLF44MKO";

/**
 * Checks whether a user has an active Pro subscription.
 * 
 * INVARIANT: This function only reads subscription status from Stripe.
 * Stripe failures here mean "assume free tier" - never degrade recommendations.
 * Subscription status gates paid tuning inputs only.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        has_paid_tuning: false,
        is_founders: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    let hasActiveSub = false;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;
    let isFounders = false;
    let foundersCityId: string | null = null;

    try {
      // Check active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      // Also check trialing (founders get 3 months free trial)
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });

      const allSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];
      hasActiveSub = allSubscriptions.length > 0;

      if (hasActiveSub) {
        // Find active/trialing subscription, prioritize founders
        const foundersSubscription = allSubscriptions.find((sub: Stripe.Subscription) => 
          sub.items.data.some((item: Stripe.SubscriptionItem) => item.price.id === FOUNDERS_PRICE_ID)
        );
        
        const subscription = foundersSubscription || allSubscriptions[0];
        
        productId = String(subscription.items.data[0]?.price?.product ?? '');
        
        // Check if this is a founders subscription
        isFounders = subscription.items.data.some((item: Stripe.SubscriptionItem) => 
          item.price.id === FOUNDERS_PRICE_ID
        );
        
        // Get founders city from subscription metadata if founders
        if (isFounders && subscription.metadata?.city_id) {
          foundersCityId = subscription.metadata.city_id;
        }
        
        // Safe date parsing
        try {
          const endTimestamp = subscription.current_period_end;
          if (endTimestamp && typeof endTimestamp === 'number' && !isNaN(endTimestamp)) {
            const endDate = new Date(endTimestamp * 1000);
            if (!isNaN(endDate.getTime())) {
              subscriptionEnd = endDate.toISOString();
            }
          } else if (typeof endTimestamp === 'string') {
            const endDate = new Date(endTimestamp);
            if (!isNaN(endDate.getTime())) {
              subscriptionEnd = endDate.toISOString();
            }
          }
        } catch (dateError) {
          logStep("Warning: Could not parse subscription end date", { 
            rawValue: subscription.current_period_end,
            error: dateError instanceof Error ? dateError.message : String(dateError)
          });
        }
        
        logStep("Active subscription found", { 
          subscriptionId: subscription.id, 
          endDate: subscriptionEnd,
          productId,
          isFounders,
          foundersCityId,
        });
      } else {
        logStep("No active subscription found");
      }
    } catch (stripeError) {
      logStep("ERROR fetching subscriptions from Stripe", { 
        message: stripeError instanceof Error ? stripeError.message : String(stripeError) 
      });
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        has_paid_tuning: false,
        is_founders: false,
        error: "Unable to verify subscription status"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If founders, also check for redemption record to get city
    if (isFounders && !foundersCityId) {
      try {
        const { data: redemption } = await supabaseClient
          .from("founders_redemptions")
          .select("city_id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (redemption?.city_id) {
          foundersCityId = redemption.city_id;
        }
      } catch (e) {
        // Ignore - not critical
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan: hasActiveSub ? "pro" : "free",
      has_paid_tuning: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      is_founders: isFounders,
      founders_city_id: foundersCityId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      subscribed: false,
      plan: "free",
      has_paid_tuning: false,
      is_founders: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
