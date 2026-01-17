import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManagePromoRequest {
  action: "get_promo_status" | "pause_promo" | "resume_promo" | "sync_redemptions";
  promo_code_id: string;
  city_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with auth context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { action, promo_code_id, city_id }: ManagePromoRequest = await req.json();

    if (!action || !promo_code_id) {
      return new Response(JSON.stringify({ error: "Missing required fields: action and promo_code_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[manage-founders-promo] Missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    console.log(`[manage-founders-promo] Action: ${action}, Promo ID: ${promo_code_id}`);

    // Handle different actions
    switch (action) {
      case "get_promo_status": {
        const promoCode = await stripe.promotionCodes.retrieve(promo_code_id);
        
        return new Response(JSON.stringify({
          success: true,
          promo_code: {
            id: promoCode.id,
            code: promoCode.code,
            active: promoCode.active,
            times_redeemed: promoCode.times_redeemed,
            max_redemptions: promoCode.max_redemptions,
            created: promoCode.created,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "pause_promo": {
        const updatedPromo = await stripe.promotionCodes.update(promo_code_id, {
          active: false,
        });

        console.log(`[manage-founders-promo] Paused promo code: ${updatedPromo.code}`);

        return new Response(JSON.stringify({
          success: true,
          promo_code: {
            id: updatedPromo.id,
            code: updatedPromo.code,
            active: updatedPromo.active,
            times_redeemed: updatedPromo.times_redeemed,
            max_redemptions: updatedPromo.max_redemptions,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "resume_promo": {
        const updatedPromo = await stripe.promotionCodes.update(promo_code_id, {
          active: true,
        });

        console.log(`[manage-founders-promo] Resumed promo code: ${updatedPromo.code}`);

        return new Response(JSON.stringify({
          success: true,
          promo_code: {
            id: updatedPromo.id,
            code: updatedPromo.code,
            active: updatedPromo.active,
            times_redeemed: updatedPromo.times_redeemed,
            max_redemptions: updatedPromo.max_redemptions,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sync_redemptions": {
        if (!city_id) {
          return new Response(JSON.stringify({ error: "city_id required for sync_redemptions" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const promoCode = await stripe.promotionCodes.retrieve(promo_code_id);
        const timesRedeemed = promoCode.times_redeemed ?? 0;

        // Update the city's founders_slots_used with Stripe's actual count
        const supabaseService = createClient(
          supabaseUrl,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { error: updateError } = await supabaseService
          .from("cities")
          .update({ founders_slots_used: timesRedeemed })
          .eq("id", city_id);

        if (updateError) {
          console.error("[manage-founders-promo] Failed to sync:", updateError);
          return new Response(JSON.stringify({ error: "Failed to sync to database" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`[manage-founders-promo] Synced city ${city_id}: ${timesRedeemed} redemptions`);

        return new Response(JSON.stringify({
          success: true,
          promo_code: {
            id: promoCode.id,
            code: promoCode.code,
            active: promoCode.active,
            times_redeemed: timesRedeemed,
            max_redemptions: promoCode.max_redemptions,
          },
          synced_slots_used: timesRedeemed,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("[manage-founders-promo] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
