-- SECURITY HARDENING: Fix linter warnings
-- 1. Fix SECURITY DEFINER view (recreate with security_invoker)
-- 2. Tighten couples INSERT policy (use RPC only)
-- 3. Add cities SELECT policy for authenticated users

-- =============================================================================
-- 1. FIX city_seeding_progress VIEW - Add SECURITY INVOKER
-- =============================================================================

DROP VIEW IF EXISTS public.city_seeding_progress;

CREATE VIEW public.city_seeding_progress 
WITH (security_invoker = on) AS
SELECT 
  c.id,
  c.name,
  c.state,
  c.country,
  c.status,
  c.target_place_count,
  c.target_anchor_count,
  c.launched_at,
  c.google_place_id,
  c.lat,
  c.lng,
  COALESCE(counts.current_place_count, 0) AS current_place_count,
  COALESCE(counts.approved_place_count, 0) AS approved_place_count,
  COALESCE(counts.pending_place_count, 0) AS pending_place_count,
  COALESCE(counts.curated_place_count, 0) AS curated_place_count,
  CASE 
    WHEN c.target_place_count > 0 
    THEN LEAST(100, ROUND((COALESCE(counts.approved_place_count, 0)::numeric / c.target_place_count) * 100))
    ELSE 0 
  END AS completion_percentage,
  COALESCE(counts.approved_place_count, 0) >= c.target_place_count AS is_ready_to_launch
FROM cities c
LEFT JOIN (
  SELECT 
    city,
    COUNT(*) AS current_place_count,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved_place_count,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_place_count,
    COUNT(*) FILTER (WHERE source = 'admin') AS curated_place_count
  FROM places
  GROUP BY city
) counts ON counts.city = c.name;

GRANT SELECT ON public.city_seeding_progress TO authenticated;

COMMENT ON VIEW public.city_seeding_progress IS 
'Aggregates place counts per city. Uses SECURITY INVOKER to respect RLS policies on cities and places tables.';

-- =============================================================================
-- 2. ADD cities SELECT POLICY for authenticated users (launched only)
-- =============================================================================

CREATE POLICY "Authenticated users can read launched cities"
ON public.cities
FOR SELECT
TO authenticated
USING (status = 'launched');

-- =============================================================================
-- 3. DROP overly permissive couples INSERT policy
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can create couples" ON public.couples;

-- The create_couple_for_current_user() RPC uses SECURITY DEFINER,
-- which bypasses RLS. Direct INSERT is intentionally disabled to prevent
-- orphan couples without proper member_profile linking.

COMMENT ON TABLE public.couples IS 
'Relationship unit for place intelligence. NOT a social profile.

INSERT: Only via create_couple_for_current_user() RPC.
Direct INSERT disabled to prevent orphaned records.

DRIFT-LOCK WARNING:
- Do NOT add bio/essay/photo fields for social purposes
- Do NOT add discovery/matching fields
- Do NOT add visibility/popularity fields
- This table exists to scope favorites and preferences to a unit
- Users are training the system, not presenting themselves';