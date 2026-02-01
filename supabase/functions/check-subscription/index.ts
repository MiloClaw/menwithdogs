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

// PRO price ID
const PRO_PRICE_ID = "price_1Sw7MD3mECGw4pQtwaQVhRF8";

/**
 * Checks whether a user has an active PRO subscription.
 * 
 * INVARIANT: This function only reads subscription status from Stripe.
 * Stripe failures here mean "assume free tier" - never degrade recommendations.
 * Subscription status gates paid tuning inputs only.
 * 
 * Response shape:
 * - subscribed: boolean (has any active sub)
 * - has_pro: boolean (PRO specifically active)
 * - plan: 'free' | 'pro'
 * - is_ambassador: boolean (gets PRO access without paying)
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

    let hasPro = false;
    let isAmbassador = false;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;

    // Check if user has ambassador role (grants Pro access without Stripe)
    try {
      const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "ambassador")
        .maybeSingle();
      
      isAmbassador = !!roleData;
      if (isAmbassador) {
        logStep("User has ambassador role", { userId: user.id });
        hasPro = true;
      }
    } catch (roleError) {
      logStep("Warning: Could not check ambassador role", { 
        error: roleError instanceof Error ? roleError.message : String(roleError) 
      });
    }

    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: hasPro,
        has_pro: hasPro,
        plan: hasPro ? "pro" : "free",
        has_paid_tuning: hasPro,
        is_ambassador: isAmbassador,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    try {
      // Check active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      // Also check trialing
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 10,
      });

      const allSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];

      for (const subscription of allSubscriptions) {
        const priceId = subscription.items.data[0]?.price?.id;
        
        if (priceId === PRO_PRICE_ID) {
          hasPro = true;
          
          // Store subscription end date
          if (!subscriptionEnd) {
            try {
              const endTimestamp = subscription.current_period_end;
              if (endTimestamp && typeof endTimestamp === 'number' && !isNaN(endTimestamp)) {
                const endDate = new Date(endTimestamp * 1000);
                if (!isNaN(endDate.getTime())) {
                  subscriptionEnd = endDate.toISOString();
                }
              }
            } catch (dateError) {
              logStep("Warning: Could not parse subscription end date");
            }
          }
          
          productId = String(subscription.items.data[0]?.price?.product ?? '');
          break;
        }
      }

      logStep("Subscription check complete", { hasPro });

    } catch (stripeError) {
      logStep("ERROR fetching subscriptions from Stripe", { 
        message: stripeError instanceof Error ? stripeError.message : String(stripeError) 
      });
      return new Response(JSON.stringify({ 
        subscribed: hasPro,
        has_pro: hasPro,
        plan: hasPro ? "pro" : "free",
        has_paid_tuning: hasPro,
        is_ambassador: isAmbassador,
        error: "Unable to verify subscription status"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      subscribed: hasPro,
      has_pro: hasPro,
      plan: hasPro ? "pro" : "free",
      has_paid_tuning: hasPro,
      product_id: productId,
      subscription_end: subscriptionEnd,
      is_ambassador: isAmbassador,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      subscribed: false,
      has_pro: false,
      plan: "free",
      has_paid_tuning: false,
      is_ambassador: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
