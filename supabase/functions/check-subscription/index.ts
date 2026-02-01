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

// Price IDs for detection
const FOUNDERS_PRICE_ID = "price_1SqamZ3Z5TtwrbktuLF44MKO";
const PRO_PRICE_ID = "price_1Sw7MD3mECGw4pQtwaQVhRF8";
const EVENT_PRICE_ID = "price_EVENT_PLACEHOLDER"; // Update when created in Stripe

interface EventSubscription {
  stripe_subscription_id: string;
  event_id?: string;
  current_period_end: string;
  status: string;
}

/**
 * Checks whether a user has active subscriptions (PRO and/or Event Posting).
 * 
 * INVARIANT: This function only reads subscription status from Stripe.
 * Stripe failures here mean "assume free tier" - never degrade recommendations.
 * Subscription status gates paid tuning inputs and event posting only.
 * 
 * Response shape:
 * - subscribed: boolean (has any active sub)
 * - has_pro: boolean (PRO specifically active)
 * - has_event_posting: boolean (at least one event sub active)
 * - event_subscriptions: array of event sub details
 * - plan: 'free' | 'pro'
 * - is_founders: boolean
 * - is_ambassador: boolean
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
        has_pro: false,
        has_event_posting: false,
        event_subscriptions: [],
        plan: "free",
        has_paid_tuning: false,
        is_founders: false,
        is_ambassador: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    let hasPro = false;
    let hasEventPosting = false;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;
    let isFounders = false;
    let foundersCityId: string | null = null;
    let isAmbassador = false;
    const eventSubscriptions: EventSubscription[] = [];

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
        hasPro = true; // Ambassadors get PRO access
      }
    } catch (roleError) {
      logStep("Warning: Could not check ambassador role", { 
        error: roleError instanceof Error ? roleError.message : String(roleError) 
      });
    }

    try {
      // Check active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 50,
      });

      // Also check trialing (founders get 3 months free trial)
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 50,
      });

      const allSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];

      for (const subscription of allSubscriptions) {
        const priceId = subscription.items.data[0]?.price?.id;
        
        // Check subscription type based on price ID
        if (priceId === FOUNDERS_PRICE_ID || priceId === PRO_PRICE_ID) {
          hasPro = true;
          
          // Check if founders
          if (priceId === FOUNDERS_PRICE_ID) {
            isFounders = true;
            if (subscription.metadata?.city_id) {
              foundersCityId = subscription.metadata.city_id;
            }
          }
          
          // Store first PRO subscription end date
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
          
        } else if (priceId === EVENT_PRICE_ID) {
          hasEventPosting = true;
          
          // Parse event subscription details
          let periodEnd = '';
          try {
            const endTimestamp = subscription.current_period_end;
            if (endTimestamp && typeof endTimestamp === 'number') {
              periodEnd = new Date(endTimestamp * 1000).toISOString();
            }
          } catch {
            // Ignore
          }
          
          eventSubscriptions.push({
            stripe_subscription_id: subscription.id,
            event_id: subscription.metadata?.event_id,
            current_period_end: periodEnd,
            status: subscription.status,
          });
        }
      }

      logStep("Subscription check complete", { 
        hasPro,
        hasEventPosting,
        eventSubscriptionCount: eventSubscriptions.length,
        isFounders,
      });

    } catch (stripeError) {
      logStep("ERROR fetching subscriptions from Stripe", { 
        message: stripeError instanceof Error ? stripeError.message : String(stripeError) 
      });
      return new Response(JSON.stringify({ 
        subscribed: false,
        has_pro: false,
        has_event_posting: false,
        event_subscriptions: [],
        plan: "free",
        has_paid_tuning: false,
        is_founders: false,
        is_ambassador: isAmbassador,
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
      } catch {
        // Ignore - not critical
      }
    }

    const hasAnySub = hasPro || hasEventPosting;

    return new Response(JSON.stringify({
      subscribed: hasAnySub,
      has_pro: hasPro,
      has_event_posting: hasEventPosting,
      event_subscriptions: eventSubscriptions,
      plan: hasPro ? "pro" : "free",
      has_paid_tuning: hasPro,
      product_id: productId,
      subscription_end: subscriptionEnd,
      is_founders: isFounders,
      founders_city_id: foundersCityId,
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
      has_event_posting: false,
      event_subscriptions: [],
      plan: "free",
      has_paid_tuning: false,
      is_founders: false,
      is_ambassador: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
