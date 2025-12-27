import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: max 3 invites per couple per day
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { couple_id, invited_email } = await req.json();

    if (!couple_id || !invited_email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is owner of this couple
    const { data: memberProfile } = await supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("couple_id", couple_id)
      .eq("is_owner", true)
      .maybeSingle();

    if (!memberProfile) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rate limit
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);

    const { count } = await supabase
      .from("couple_invites")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", couple_id)
      .gte("created_at", windowStart.toISOString());

    if (count && count >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ 
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} invites per ${RATE_LIMIT_WINDOW_HOURS} hours.` 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate secure token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Hash token for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store invite
    const { error: insertError } = await supabase
      .from("couple_invites")
      .insert({
        couple_id,
        invited_by: user.id,
        invited_email: invited_email.toLowerCase(),
        token_hash: tokenHash,
      });

    if (insertError) throw insertError;

    // Get the origin for the invite link
    const origin = req.headers.get("origin") || "https://mainstreetirl.com";
    const inviteLink = `${origin}/invite/${token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "MainStreetIRL <invites@resend.dev>",
      to: [invited_email],
      subject: "You're invited to join MainStreetIRL",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="font-size: 24px; color: #1a1a1a;">You're invited!</h1>
          <p style="color: #666; line-height: 1.6;">
            Your partner has invited you to create a couple profile on MainStreetIRL.
          </p>
          <p style="margin: 24px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #999; font-size: 14px;">
            This invitation expires in 7 days.
          </p>
        </div>
      `,
    });

    console.log("Invite sent successfully:", { couple_id, invited_email });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-invite:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
