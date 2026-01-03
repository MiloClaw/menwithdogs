DROP VIEW IF EXISTS city_seeding_progress;

CREATE VIEW city_seeding_progress AS
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