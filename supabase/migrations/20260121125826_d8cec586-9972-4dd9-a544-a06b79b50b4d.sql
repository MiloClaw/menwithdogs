-- Step 1: Add metro_id column to cities table
ALTER TABLE cities 
ADD COLUMN IF NOT EXISTS metro_id uuid REFERENCES geo_areas(id);

-- Step 2: Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_cities_metro_id ON cities(metro_id);

-- Step 3: Drop dependent materialized view
DROP MATERIALIZED VIEW IF EXISTS admin_dashboard_stats;

-- Step 4: Drop the old view
DROP VIEW IF EXISTS city_seeding_progress;

-- Step 5: Recreate the view with metro_id
CREATE VIEW city_seeding_progress AS
SELECT 
  c.id,
  c.name,
  c.state,
  c.country,
  c.status,
  c.target_place_count,
  c.target_anchor_count,
  c.google_place_id,
  c.lat,
  c.lng,
  c.launched_at,
  c.metro_id,
  COALESCE(counts.total_places, 0)::bigint as current_place_count,
  COALESCE(counts.approved_places, 0)::bigint as approved_place_count,
  COALESCE(counts.pending_places, 0)::bigint as pending_place_count,
  COALESCE(counts.curated_places, 0)::bigint as curated_place_count,
  CASE 
    WHEN c.target_place_count > 0 
    THEN ROUND((COALESCE(counts.approved_places, 0)::numeric / c.target_place_count::numeric) * 100, 0)
    ELSE 0 
  END as completion_percentage,
  CASE 
    WHEN COALESCE(counts.approved_places, 0) >= c.target_place_count THEN true
    ELSE false
  END as is_ready_to_launch
FROM cities c
LEFT JOIN (
  SELECT 
    city,
    state,
    COUNT(*) as total_places,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_places,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_places,
    COUNT(*) FILTER (WHERE source = 'admin') as curated_places
  FROM places
  GROUP BY city, state
) counts ON LOWER(counts.city) = LOWER(c.name) 
  AND (counts.state = c.state OR (counts.state IS NULL AND c.state IS NULL));

-- Step 6: Grant access to the view
GRANT SELECT ON city_seeding_progress TO authenticated;
GRANT SELECT ON city_seeding_progress TO anon;

-- Step 7: Recreate the admin_dashboard_stats materialized view
CREATE MATERIALIZED VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM couples) as total_couples,
  (SELECT COUNT(*) FROM couples WHERE status = 'active') as active_couples,
  (SELECT COUNT(*) FROM couples WHERE created_at > NOW() - INTERVAL '7 days') as new_couples_7d,
  (SELECT COUNT(*) FROM places WHERE status = 'approved') as approved_places,
  (SELECT COUNT(*) FROM places WHERE status = 'pending') as pending_places,
  (SELECT COUNT(*) FROM places WHERE status = 'rejected') as rejected_places,
  (SELECT COUNT(*) FROM events WHERE status = 'approved') as approved_events,
  (SELECT COUNT(*) FROM events WHERE status = 'pending') as pending_events,
  (SELECT COUNT(*) FROM cities WHERE status = 'launched') as launched_cities,
  (SELECT COUNT(*) FROM cities WHERE status = 'draft') as draft_cities,
  (SELECT COUNT(*) FROM city_seeding_progress WHERE is_ready_to_launch = true AND status = 'draft') as ready_to_launch_cities,
  (SELECT AVG(fav_count) FROM (SELECT COUNT(*) as fav_count FROM couple_favorites GROUP BY couple_id) as counts) as avg_favorites_per_couple,
  NOW() as last_refreshed;

GRANT SELECT ON admin_dashboard_stats TO authenticated;