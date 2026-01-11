-- Revoke API access from admin_dashboard_stats materialized view
-- This materialized view contains admin-only statistics and should not be accessible via the Data API
REVOKE SELECT ON public.admin_dashboard_stats FROM anon;
REVOKE SELECT ON public.admin_dashboard_stats FROM authenticated;

-- Add a comment explaining why this is restricted
COMMENT ON MATERIALIZED VIEW public.admin_dashboard_stats IS 'Admin-only dashboard statistics. Access revoked from API - use refresh_admin_dashboard_stats() function instead.';