import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[SEND-PASSWORD-RESET] RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      console.error("[SEND-PASSWORD-RESET] Missing required fields", { email: !!email, resetUrl: !!resetUrl });
      throw new Error("Missing required fields: email and resetUrl");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("[SEND-PASSWORD-RESET] Invalid email format", { email });
      throw new Error("Invalid email format");
    }

    console.log("[SEND-PASSWORD-RESET] Sending password reset email", { email, resetUrlLength: resetUrl.length });

    const { error } = await resend.emails.send({
      from: "ThickTimber <noreply@thicktimber.com>",
      to: [email],
      subject: "Reset your password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #1a1a1a;">
            Reset your password
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">
            We received a request to reset your password for your ThickTimber account. Click the button below to choose a new one.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
            Reset Password
          </a>
          <p style="font-size: 14px; line-height: 1.6; color: #888888; margin-top: 32px;">
            If you didn't request this, you can safely ignore this email. This link expires in 1 hour.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #888888; margin-top: 16px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; line-height: 1.4; color: #666666; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #888888;">
            ThickTimber — Outdoor places shaped by shared interests
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[SEND-PASSWORD-RESET] Resend error:", error);
      throw new Error("Failed to send email");
    }

    console.log("[SEND-PASSWORD-RESET] Email sent successfully", { email });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[SEND-PASSWORD-RESET] Error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to send password reset email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
