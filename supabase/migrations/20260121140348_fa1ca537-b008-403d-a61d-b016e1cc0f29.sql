-- Create city records for places that have approved places but no matching city
INSERT INTO public.cities (name, state, country, lat, lng, status, launched_at, target_place_count, target_anchor_count)
SELECT DISTINCT ON (p.city, p.state)
  p.city as name,
  p.state,
  COALESCE(p.country, 'USA') as country,
  p.lat,
  p.lng,
  'launched' as status,
  NOW() as launched_at,
  50 as target_place_count,
  10 as target_anchor_count
FROM places p
WHERE p.status = 'approved'
  AND p.city IS NOT NULL
  AND p.state IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM cities c 
    WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.city)) 
      AND c.state = p.state
  )
ORDER BY p.city, p.state, p.created_at;