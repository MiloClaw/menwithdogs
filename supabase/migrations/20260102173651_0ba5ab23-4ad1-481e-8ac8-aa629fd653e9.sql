-- Fix SECURITY DEFINER views by recreating with SECURITY INVOKER
-- This ensures RLS policies are applied to the querying user

DROP VIEW IF EXISTS place_presence_agg;
DROP VIEW IF EXISTS event_presence_agg;
DROP VIEW IF EXISTS revealed_couples_view;

-- Recreate place_presence_agg with SECURITY INVOKER
CREATE VIEW place_presence_agg
WITH (security_invoker = on) AS
SELECT 
  place_id,
  COUNT(*) FILTER (WHERE status = 'interested') AS interested_count,
  COUNT(*) FILTER (WHERE status = 'planning_to_attend' AND ends_at > now()) AS planning_count,
  COUNT(*) FILTER (WHERE status = 'open_to_hello' AND ends_at > now()) AS open_count
FROM couple_presence
WHERE place_id IS NOT NULL
GROUP BY place_id;

-- Recreate event_presence_agg with SECURITY INVOKER
CREATE VIEW event_presence_agg
WITH (security_invoker = on) AS
SELECT 
  event_id,
  COUNT(*) FILTER (WHERE status = 'interested') AS interested_count,
  COUNT(*) FILTER (WHERE status = 'planning_to_attend' AND ends_at > now()) AS planning_count,
  COUNT(*) FILTER (WHERE status = 'open_to_hello' AND ends_at > now()) AS open_count
FROM couple_presence
WHERE event_id IS NOT NULL
GROUP BY event_id;

-- Recreate revealed_couples_view with SECURITY INVOKER
CREATE VIEW revealed_couples_view
WITH (security_invoker = on) AS
SELECT 
  cr.id,
  cr.context_type,
  cr.place_id,
  cr.event_id,
  cr.couple_a_id,
  cr.couple_b_id,
  cr.expires_at,
  ca.display_name AS couple_a_display_name,
  ca.profile_photo_url AS couple_a_photo,
  cb.display_name AS couple_b_display_name,
  cb.profile_photo_url AS couple_b_photo
FROM couple_reveals cr
JOIN couples ca ON cr.couple_a_id = ca.id
JOIN couples cb ON cr.couple_b_id = cb.id
WHERE cr.state = 'revealed'
  AND cr.expires_at > now();