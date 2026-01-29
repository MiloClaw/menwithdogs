import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-EVENT-CHECKOUT] ${step}${detailsStr}`);
};

// Price IDs
const PRO_PRICE_ID = "price_1SoCRr3Z5TtwrbktT3NwVLwc";
const FOUNDERS_PRICE_ID = "price_1SqamZ3Z5TtwrbktuLF44MKO";
const EVENT_PRICE_ID = "price_EVENT_PLACEHOLDER"; // Update with actual Stripe price ID

/**
 * Creates a Stripe Checkout session for Event Posting subscription.
 * 
 * REQUIRES: Active PRO subscription
 * 
 * Request body:
 * - event_id: string (the event to link this subscription to)
 * - couple_id?: string (optional)
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

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const eventId = body.event_id;
    const coupleId = body.couple_id;

    if (!eventId) {
      throw new Error("event_id is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // First, verify user has active PRO subscription
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("PRO subscription required to post events");
    }

    const customerId = customers.data[0].id;

    // Check for active PRO subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 50,
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 50,
    });

    const allSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];
    
    const hasProSubscription = allSubscriptions.some(sub => {
      const priceId = sub.items.data[0]?.price?.id;
      return priceId === PRO_PRICE_ID || priceId === FOUNDERS_PRICE_ID;
    });

    // Also check for ambassador role (grants PRO access)
    let isAmbassador = false;
    try {
      const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "ambassador")
        .maybeSingle();
      
      isAmbassador = !!roleData;
    } catch {
      // Ignore
    }

    if (!hasProSubscription && !isAmbassador) {
      throw new Error("PRO subscription required to post events. Please subscribe to PRO first.");
    }

    logStep("PRO subscription verified", { customerId, isAmbassador });

    // Verify the event exists and belongs to this user (or is a pending draft)
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("id, name, posted_by, status")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    // Verify user owns this event draft
    if (event.posted_by !== user.id) {
      throw new Error("You can only pay for events you created");
    }

    logStep("Event verified", { eventId: event.id, eventName: event.name });

    // Create checkout session for Event Posting
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: EVENT_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/settings?tab=account&event_subscription=success&event_id=${eventId}`,
      cancel_url: `${req.headers.get("origin")}/settings?tab=account`,
      metadata: {
        user_id: user.id,
        couple_id: coupleId || "",
        event_id: eventId,
        subscription_type: "event",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          event_id: eventId,
          subscription_type: "event",
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Map specific user-facing errors, sanitize others
    const userFacingErrors = [
      "event_id is required",
      "PRO subscription required",
      "Event not found",
      "You can only pay for events you created"
    ];
    
    const isUserFacingError = userFacingErrors.some(msg => errorMessage.includes(msg));
    const clientError = isUserFacingError ? errorMessage : "Unable to create checkout session. Please try again.";
    
    return new Response(JSON.stringify({ error: clientError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
