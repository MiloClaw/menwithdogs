-- Fix: Exclude view from API and add security invoker mode
-- This makes the view respect RLS of the calling user

-- Remove from public API exposure
ALTER VIEW public.admin_outdoor_preference_debug SET (security_invoker = true);

-- Revoke public/anon access to the view
REVOKE ALL ON public.admin_outdoor_preference_debug FROM anon, authenticated;

-- Grant only to authenticated users (RLS will handle admin check)
GRANT SELECT ON public.admin_outdoor_preference_debug TO authenticated;