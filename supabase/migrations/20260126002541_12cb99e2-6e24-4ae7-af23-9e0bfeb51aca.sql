-- Create function to get preference-aligned places (place-centric boost, no user IDs exposed)
CREATE OR REPLACE FUNCTION public.get_preference_aligned_places(_user_id uuid)
RETURNS TABLE (place_id uuid, alignment_boost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH my_prefs AS (
    SELECT activities, timing_preferences, place_usage
    FROM user_preferences
    WHERE user_id = _user_id
  ),
  similar_users AS (
    SELECT up.user_id as other_user_id
    FROM user_preferences up, my_prefs m
    WHERE up.user_id != _user_id
      AND up.allow_place_visibility = true
      AND m.activities IS NOT NULL
      AND up.activities IS NOT NULL
      AND (
        -- At least 3 overlapping preferences across activities and timing
        COALESCE(array_length(ARRAY(SELECT unnest(m.activities) INTERSECT SELECT unnest(up.activities)), 1), 0) +
        COALESCE(array_length(ARRAY(SELECT unnest(m.timing_preferences) INTERSECT SELECT unnest(up.timing_preferences)), 1), 0)
      ) >= 3
  ),
  similar_couples AS (
    SELECT DISTINCT mp.couple_id
    FROM similar_users su
    JOIN member_profiles mp ON mp.user_id = su.other_user_id
  )
  SELECT 
    cf.place_id,
    LEAST(0.2, COUNT(*)::numeric * 0.05) as alignment_boost  -- Soft cap at 0.2
  FROM couple_favorites cf
  JOIN similar_couples sc ON sc.couple_id = cf.couple_id
  GROUP BY cf.place_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_preference_aligned_places(uuid) TO authenticated;

-- Update compute_user_affinity to include new profile preference domains
-- First, check if the function exists and drop it
DROP FUNCTION IF EXISTS public.compute_user_affinity(uuid);

-- Create the updated compute_user_affinity function
CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid)
RETURNS TABLE (
  category text,
  affinity_score numeric,
  source_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH affinity_sources AS (
    -- PRO context selections (from pro_context_definitions)
    SELECT 
      unnest(pcd.maps_to_google_types) as category,
      COALESCE(pcd.default_confidence_cap, 0.3) as weighted_score,
      'pro_selection' as source_type
    FROM user_signals us
    JOIN pro_context_definitions pcd ON pcd.key = us.entity_id
    WHERE us.user_id = _user_id
      AND us.signal_type = 'pro_selection'
      AND us.value = 'true'
      AND pcd.influence_mode = 'boost'
      AND pcd.is_active = true
      AND us.created_at > NOW() - INTERVAL '180 days'

    UNION ALL

    -- Intent preferences (from user_preferences.intent_preferences via preference_definitions)
    SELECT 
      unnest(pd.maps_to_primary_categories) as category,
      0.8 as weighted_score,  -- High weight for explicit intent
      'intent_preference' as source_type
    FROM user_preferences up
    CROSS JOIN LATERAL unnest(up.intent_preferences) as intent(val)
    JOIN preference_definitions pd ON pd.preference_key = intent.val AND pd.domain = 'intent'
    WHERE up.user_id = _user_id
      AND up.intent_preferences IS NOT NULL
      AND array_length(up.intent_preferences, 1) > 0
      AND pd.is_active = true

    UNION ALL

    -- Activity preferences (from user_preferences.activities via preference_definitions)
    SELECT 
      unnest(pd.maps_to_primary_categories) as category,
      0.7 as weighted_score,  -- Strong weight for activities
      'activity_preference' as source_type
    FROM user_preferences up
    CROSS JOIN LATERAL unnest(up.activities) as activity(val)
    JOIN preference_definitions pd ON pd.preference_key = activity.val AND pd.domain = 'activity'
    WHERE up.user_id = _user_id
      AND up.activities IS NOT NULL
      AND array_length(up.activities, 1) > 0
      AND pd.is_active = true

    UNION ALL

    -- Place usage preferences (from user_preferences.place_usage via preference_definitions)
    SELECT 
      unnest(pd.maps_to_primary_categories) as category,
      0.5 as weighted_score,  -- Moderate weight for usage patterns
      'usage_preference' as source_type
    FROM user_preferences up
    CROSS JOIN LATERAL unnest(up.place_usage) as usage(val)
    JOIN preference_definitions pd ON pd.preference_key = usage.val AND pd.domain = 'usage'
    WHERE up.user_id = _user_id
      AND up.place_usage IS NOT NULL
      AND array_length(up.place_usage, 1) > 0
      AND pd.is_active = true
      AND array_length(pd.maps_to_primary_categories, 1) > 0

    UNION ALL

    -- Favorite places signal (boost categories of favorited places)
    SELECT 
      p.primary_category as category,
      0.6 as weighted_score,
      'favorite_place' as source_type
    FROM couple_favorites cf
    JOIN member_profiles mp ON mp.couple_id = cf.couple_id AND mp.user_id = _user_id
    JOIN places p ON p.id = cf.place_id
    WHERE p.primary_category IS NOT NULL
  )
  SELECT 
    a.category,
    AVG(a.weighted_score) as affinity_score,
    string_agg(DISTINCT a.source_type, ', ') as source_type
  FROM affinity_sources a
  WHERE a.category IS NOT NULL AND a.category != ''
  GROUP BY a.category
  ORDER BY affinity_score DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.compute_user_affinity(uuid) TO authenticated;