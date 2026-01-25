-- Phase 4: Admin debug view for outdoor preference mapping verification
-- Read-only, admin-only access for shadow evaluation

CREATE VIEW public.admin_outdoor_preference_debug AS
SELECT 
  us.user_id,
  pcd.key as preference,
  pcd.label as preference_label,
  pcd.maps_to_google_types as mapped_types,
  COUNT(DISTINCT cf.place_id) as matching_favorites,
  ARRAY_AGG(DISTINCT p.google_primary_type) FILTER (WHERE p.google_primary_type IS NOT NULL) as matched_types,
  ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as matched_place_names
FROM user_signals us
JOIN pro_context_definitions pcd 
  ON pcd.key = us.signal_key 
  AND us.signal_type = 'pro_selection'
  AND us.signal_value = 'true'
JOIN member_profiles mp 
  ON mp.user_id = us.user_id 
  AND mp.is_owner = true
LEFT JOIN couple_favorites cf 
  ON cf.couple_id = mp.couple_id
LEFT JOIN places p 
  ON p.id = cf.place_id 
  AND p.google_primary_type = ANY(pcd.maps_to_google_types)
  AND p.status = 'approved'
WHERE pcd.maps_to_google_types IS NOT NULL 
  AND cardinality(pcd.maps_to_google_types) > 0
GROUP BY us.user_id, pcd.key, pcd.label, pcd.maps_to_google_types;