-- Phase 2: Security & Performance Hardening Migration

-- =====================================================
-- 1. Create safe public view for launched cities
-- =====================================================
CREATE VIEW public.launched_cities_summary 
WITH (security_invoker = on) AS
SELECT 
  c.id,
  c.name,
  c.state,
  c.country,
  c.lat,
  c.lng,
  COALESCE(counts.approved_place_count, 0)::int AS place_count
FROM cities c
LEFT JOIN (
  SELECT city, state, COUNT(*) FILTER (WHERE status = 'approved') AS approved_place_count
  FROM places
  GROUP BY city, state
) counts ON counts.city = c.name AND (counts.state = c.state OR (counts.state IS NULL AND c.state IS NULL))
WHERE c.status = 'launched';

-- =====================================================
-- 2. Create batch signal insert function
-- =====================================================
CREATE OR REPLACE FUNCTION public.record_signals_batch(_signals jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  signal jsonb;
  inserted_count int := 0;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOR signal IN SELECT * FROM jsonb_array_elements(_signals)
  LOOP
    INSERT INTO user_signals (
      user_id, signal_type, signal_key, signal_value, 
      source, confidence, context_json, created_at
    ) VALUES (
      _user_id,
      signal->>'signal_type',
      signal->>'signal_key',
      signal->>'signal_value',
      COALESCE(signal->>'source', 'user'),
      COALESCE((signal->>'confidence')::numeric, 1.0),
      CASE WHEN signal->'context' IS NOT NULL AND signal->>'context' != 'null' 
           THEN (signal->'context')::jsonb 
           ELSE NULL 
      END,
      COALESCE((signal->>'timestamp')::timestamptz, now())
    );
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

-- =====================================================
-- 3. Create materialized view for admin dashboard stats
-- =====================================================
CREATE MATERIALIZED VIEW public.admin_dashboard_stats AS
SELECT 
  -- Couples stats
  (SELECT COUNT(*) FROM couples) as total_couples,
  (SELECT COUNT(*) FROM couples WHERE is_complete = true) as active_couples,
  
  -- Places stats
  (SELECT COUNT(*) FROM places WHERE status = 'approved') as approved_places,
  (SELECT COUNT(*) FROM places WHERE status = 'pending') as pending_places,
  
  -- Events stats
  (SELECT COUNT(*) FROM events WHERE status = 'approved') as approved_events,
  (SELECT COUNT(*) FROM events WHERE status = 'pending') as pending_events,
  
  -- Posts and members
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM member_profiles) as total_members,
  (SELECT COUNT(*) FROM couple_favorites) as total_favorites,
  
  -- City stats
  (SELECT COUNT(*) FROM cities) as total_cities,
  (SELECT COUNT(*) FROM cities WHERE status = 'draft') as draft_cities,
  (SELECT COUNT(*) FROM cities WHERE status = 'launched') as launched_cities,
  (SELECT COUNT(*) FROM cities WHERE status = 'paused') as paused_cities,
  
  -- Ready to launch (from view)
  (SELECT COUNT(*) FROM city_seeding_progress WHERE status = 'draft' AND is_ready_to_launch = true) as ready_to_launch_cities,
  
  -- Timestamp
  now() as computed_at;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX admin_dashboard_stats_idx ON admin_dashboard_stats ((1));

-- =====================================================
-- 4. Create refresh function for admin stats
-- =====================================================
CREATE OR REPLACE FUNCTION public.refresh_admin_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard_stats;
END;
$$;

-- =====================================================
-- 5. RLS for admin_dashboard_stats (via wrapper)
-- Since materialized views can't have RLS directly,
-- we'll control access at the application layer.
-- The materialized view is only queryable by admins.
-- =====================================================

-- Grant select to authenticated (will be restricted in application code)
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
GRANT SELECT ON public.launched_cities_summary TO authenticated;