-- Fix: Recreate view with SECURITY INVOKER to respect RLS
DROP VIEW IF EXISTS public.city_seeding_progress;

CREATE OR REPLACE VIEW public.city_seeding_progress 
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
  COALESCE(counts.total_places, 0) AS current_place_count,
  COALESCE(counts.approved_places, 0) AS approved_place_count,
  COALESCE(counts.pending_places, 0) AS pending_place_count,
  COALESCE(counts.places_with_vibes, 0) AS curated_place_count,
  CASE 
    WHEN c.target_place_count > 0 
    THEN ROUND((COALESCE(counts.approved_places, 0)::numeric / c.target_place_count) * 100)
    ELSE 0 
  END AS completion_percentage,
  COALESCE(counts.approved_places, 0) >= c.target_place_count AS is_ready_to_launch
FROM public.cities c
LEFT JOIN (
  SELECT 
    city,
    state,
    COUNT(*) AS total_places,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved_places,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_places,
    COUNT(*) FILTER (WHERE vibe_energy IS NOT NULL OR vibe_formality IS NOT NULL) AS places_with_vibes
  FROM public.places
  GROUP BY city, state
) counts ON LOWER(c.name) = LOWER(counts.city) AND 
            (c.state IS NULL AND counts.state IS NULL OR LOWER(c.state) = LOWER(counts.state));

-- Grant access to the view
GRANT SELECT ON public.city_seeding_progress TO authenticated;