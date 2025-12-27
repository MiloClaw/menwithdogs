import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hash the incoming token to compare
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from("couple_invites")
      .select("*")
      .eq("token_hash", tokenHash)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (inviteError) throw inviteError;

    if (!invite) {
      return new Response(JSON.stringify({ 
        error: "Invalid or expired invitation",
        code: "INVALID_INVITE" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email matches
    if (invite.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(JSON.stringify({ 
        error: "This invitation was sent to a different email address",
        code: "EMAIL_MISMATCH" 
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has a profile (can't join multiple couples)
    const { data: existingProfile } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ 
        error: "You already belong to a couple",
        code: "ALREADY_IN_COUPLE" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check couple doesn't already have 2 members
    const { count: memberCount } = await supabase
      .from("member_profiles")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", invite.couple_id);

    if (memberCount && memberCount >= 2) {
      return new Response(JSON.stringify({ 
        error: "This couple already has two members",
        code: "COUPLE_FULL" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create member profile for Partner B
    const { error: profileError } = await supabase
      .from("member_profiles")
      .insert({
        user_id: user.id,
        couple_id: invite.couple_id,
        is_owner: false,
      });

    if (profileError) throw profileError;

    // Mark invite as accepted
    const { error: updateInviteError } = await supabase
      .from("couple_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateInviteError) throw updateInviteError;

    // Mark couple as complete
    const { error: updateCoupleError } = await supabase
      .from("couples")
      .update({ is_complete: true })
      .eq("id", invite.couple_id);

    if (updateCoupleError) throw updateCoupleError;

    console.log("Invite accepted:", { 
      couple_id: invite.couple_id, 
      user_id: user.id 
    });

    return new Response(JSON.stringify({ 
      success: true,
      couple_id: invite.couple_id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in validate-invite:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
