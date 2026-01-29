-- Fix SECURITY DEFINER view issue for city_seeding_progress
-- Use ALTER VIEW to set security_invoker without dropping the view
-- This preserves dependent objects like admin_dashboard_stats materialized view

ALTER VIEW public.city_seeding_progress SET (security_invoker = true);