-- PHASE 2: Extend compute_user_affinity to blend multiple signal sources
-- This replaces the saves-only version with a weighted blend

CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _couple_id uuid;
BEGIN
  -- Get user's preference group (couple)
  SELECT couple_id INTO _couple_id
  FROM member_profiles
  WHERE user_id = _user_id AND is_owner = true
  LIMIT 1;
  
  IF _couple_id IS NULL THEN RETURN; END IF;
  
  -- Compute affinities from ALL signal sources with weights
  -- Signal weights: saves=1.0, clicks=0.5, views=0.3, filters=0.4, explicit=0.8
  INSERT INTO user_place_affinity (user_id, place_category, affinity_score, confidence, supporting_signals_count, last_updated)
  SELECT 
    _user_id,
    category,
    -- Weighted blend, normalized to 0-1
    LEAST(1.0, SUM(weighted_score) / GREATEST(1, COUNT(*) * 0.5)),
    -- Confidence grows with signal count
    LEAST(1.0, COUNT(*)::numeric / 10),
    COUNT(*)::int,
    NOW()
  FROM (
    -- 1. Saves from couple_favorites (weight 1.0) - strongest signal
    SELECT p.primary_category as category, 1.0 as weighted_score
    FROM couple_favorites cf
    JOIN places p ON p.id = cf.place_id
    WHERE cf.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 2. View signals (weight 0.3) - passive interest
    SELECT p.primary_category as category, 0.3 as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_place'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 3. Click external signals (weight 0.5) - active interest
    SELECT p.primary_category as category, 0.5 as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'click_external'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 4. Filter category signals (weight 0.4) - explicit browsing interest
    SELECT us.signal_key as category, 0.4 as weighted_score
    FROM user_signals us
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'filter_category'
      AND us.signal_key IS NOT NULL
    
    UNION ALL
    
    -- 5. Explicit intent preferences (weight 0.8 per matched category)
    -- Expand intent preferences to their mapped categories
    SELECT unnest(pd.maps_to_primary_categories) as category, 0.8 as weighted_score
    FROM user_preferences up
    CROSS JOIN LATERAL jsonb_array_elements_text(up.intent_preferences) as intent(val)
    JOIN preference_definitions pd ON pd.preference_key = intent.val AND pd.domain = 'intent'
    WHERE up.user_id = _user_id
      AND up.intent_preferences IS NOT NULL
      AND jsonb_array_length(up.intent_preferences) > 0
  ) as signals
  WHERE category IS NOT NULL
  GROUP BY category
  ON CONFLICT (user_id, place_category)
  DO UPDATE SET
    affinity_score = EXCLUDED.affinity_score,
    confidence = EXCLUDED.confidence,
    supporting_signals_count = EXCLUDED.supporting_signals_count,
    last_updated = EXCLUDED.last_updated;
END;
$function$;