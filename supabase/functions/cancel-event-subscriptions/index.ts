import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-EVENT-SUBSCRIPTIONS] ${step}${detailsStr}`);
};

const EVENT_PRICE_ID = "price_EVENT_PLACEHOLDER"; // Update with actual Stripe price ID

/**
 * Cancels all Event Posting subscriptions for a user.
 * 
 * Called when:
 * 1. User explicitly cancels an event subscription
 * 2. User cancels their PRO subscription (cascade)
 * 
 * Request body:
 * - subscription_id?: string (cancel specific subscription)
 * - cascade_from_pro?: boolean (cancel all event subs due to PRO cancellation)
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

    const body = await req.json().catch(() => ({}));
    const specificSubscriptionId = body.subscription_id;
    const cascadeFromPro = body.cascade_from_pro === true;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No subscriptions to cancel" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const canceledSubscriptions: string[] = [];
    const updatedEvents: string[] = [];

    if (specificSubscriptionId) {
      // Cancel specific subscription
      logStep("Canceling specific subscription", { subscriptionId: specificSubscriptionId });
      
      const subscription = await stripe.subscriptions.retrieve(specificSubscriptionId);
      
      // Verify this subscription belongs to the user
      if (subscription.customer !== customerId) {
        throw new Error("Subscription does not belong to this user");
      }

      // Cancel at period end (user keeps access until billing period ends)
      await stripe.subscriptions.update(specificSubscriptionId, {
        cancel_at_period_end: true,
      });

      canceledSubscriptions.push(specificSubscriptionId);

      // Update event visibility_end_at
      const eventId = subscription.metadata?.event_id;
      if (eventId) {
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        await supabaseClient
          .from("events")
          .update({ visibility_end_at: periodEnd })
          .eq("id", eventId)
          .eq("posted_by", user.id);
        
        updatedEvents.push(eventId);
      }

    } else if (cascadeFromPro) {
      // Cancel ALL event subscriptions (PRO cancellation cascade)
      logStep("Cascading cancellation from PRO", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 100,
      });

      for (const subscription of subscriptions.data) {
        const priceId = subscription.items.data[0]?.price?.id;
        
        if (priceId === EVENT_PRICE_ID) {
          await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });

          canceledSubscriptions.push(subscription.id);

          // Update event visibility
          const eventId = subscription.metadata?.event_id;
          if (eventId) {
            const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
            
            await supabaseClient
              .from("events")
              .update({ visibility_end_at: periodEnd })
              .eq("id", eventId)
              .eq("posted_by", user.id);
            
            updatedEvents.push(eventId);
          }
        }
      }
    } else {
      throw new Error("Must specify subscription_id or cascade_from_pro");
    }

    logStep("Cancellation complete", { 
      canceledCount: canceledSubscriptions.length,
      updatedEventsCount: updatedEvents.length,
    });

    return new Response(JSON.stringify({ 
      success: true,
      canceled_subscriptions: canceledSubscriptions,
      updated_events: updatedEvents,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
