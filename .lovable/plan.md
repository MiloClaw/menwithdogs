

# Plan: Implement Password Reset Email with Resend

## Overview

Implement a complete "Forgot Password" flow that sends branded password reset emails via Resend, integrating with Supabase Auth's built-in password recovery system.

---

## Current State

| Component | Status |
|-----------|--------|
| Auth Page (`/auth`) | No "Forgot password" link |
| Password Change | Exists in Settings (requires being logged in) |
| Password Reset Edge Function | Does not exist |
| Reset Password Page | Does not exist |
| Resend API Key | Configured in secrets |

---

## Architecture

```text
User Flow:
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   /auth (login page)                                                     │
│   └── "Forgot password?" link                                            │
│       └── Opens ForgotPasswordDialog                                     │
│           └── User enters email                                          │
│               └── Calls supabase.auth.resetPasswordForEmail()            │
│                   └── Supabase sends webhook to edge function            │
│                       └── Edge function sends branded email via Resend   │
│                           └── User clicks link                           │
│                               └── /reset-password page                   │
│                                   └── User sets new password             │
│                                       └── supabase.auth.updateUser()     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Phase 1: Edge Function for Password Reset Email

Create a new edge function that sends branded password reset emails via Resend.

| File | Action |
|------|--------|
| `supabase/functions/send-password-reset/index.ts` | Create edge function |
| `supabase/config.toml` | Add function config with `verify_jwt = false` |

**Edge Function Implementation:**

```typescript
// supabase/functions/send-password-reset/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email and resetUrl");
    }

    const { error } = await resend.emails.send({
      from: "ThickTimber <noreply@thicktimber.com>",
      to: [email],
      subject: "Reset your password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #1a1a1a;">
            Reset your password
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
            Reset Password
          </a>
          <p style="font-size: 14px; line-height: 1.6; color: #888888; margin-top: 32px;">
            If you didn't request this, you can safely ignore this email. This link expires in 1 hour.
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
```

---

### Phase 2: Forgot Password Dialog Component

Create a dialog component for requesting password reset from the login page.

| File | Action |
|------|--------|
| `src/components/auth/ForgotPasswordDialog.tsx` | Create new component |

**Component Implementation:**

```typescript
// Key features:
// - Email input with zod validation
// - Calls supabase.auth.resetPasswordForEmail() 
// - Also calls edge function to send branded email via Resend
// - Shows success state with instructions
// - Mobile-first with 44px touch targets
```

---

### Phase 3: Reset Password Page

Create a dedicated page for users clicking the reset link from their email.

| File | Action |
|------|--------|
| `src/pages/ResetPassword.tsx` | Create new page |
| `src/App.tsx` | Add route `/reset-password` |

**Page Features:**
- Extracts token from URL hash (Supabase format: `#access_token=...&type=recovery`)
- Sets new password using `supabase.auth.updateUser()`
- Redirects to `/places` on success
- Handles errors gracefully
- Branded with SEOHead, BrandLockup, BrandStripe

---

### Phase 4: Update Auth Page

Add "Forgot password?" link to the sign-in form.

| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Add forgot password link + import dialog |

**Changes:**
- Add `ForgotPasswordDialog` state and component
- Add subtle link below password field: "Forgot password?"
- Only show link when in sign-in mode

---

## Files Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/send-password-reset/index.ts` |
| Create | `src/components/auth/ForgotPasswordDialog.tsx` |
| Create | `src/pages/ResetPassword.tsx` |
| Modify | `supabase/config.toml` |
| Modify | `src/pages/Auth.tsx` |
| Modify | `src/App.tsx` |

Total: 3 new files, 3 modified files

---

## Security Considerations

1. **Rate Limiting**: Supabase Auth has built-in rate limiting for `resetPasswordForEmail()`
2. **Token Expiry**: Reset tokens expire after 1 hour (Supabase default)
3. **No User Enumeration**: Always show success message regardless of whether email exists
4. **HTTPS Only**: Reset URLs use production domain (`thicktimber.com`)
5. **Input Validation**: Email validated with zod before sending

---

## Domain Requirement

The edge function uses `from: "ThickTimber <noreply@thicktimber.com>"`. This requires:
- Domain `thicktimber.com` verified in Resend dashboard
- DNS records configured for email sending (SPF, DKIM)

If the domain is not yet verified, the from address should temporarily use Resend's test domain: `"ThickTimber <onboarding@resend.dev>"`

