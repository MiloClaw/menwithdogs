-- Add unsave_event consumption to compute_user_affinity for complete event signal symmetry
CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _couple_id uuid;
  _decay_half_life_days constant numeric := 90;
  _decay_seconds constant numeric := 90 * 24 * 3600;
BEGIN
  -- Get user's preference group (couple)
  SELECT couple_id INTO _couple_id
  FROM member_profiles
  WHERE user_id = _user_id AND is_owner = true
  LIMIT 1;
  
  IF _couple_id IS NULL THEN RETURN; END IF;
  
  -- Compute affinities from ALL signal sources with weights
  INSERT INTO user_place_affinity (user_id, place_category, affinity_score, confidence, supporting_signals_count, last_updated)
  SELECT 
    _user_id,
    category,
    -- Weighted blend, normalized to 0-1
    LEAST(1.0, GREATEST(0, SUM(weighted_score) / GREATEST(1, COUNT(*) * 0.5))),
    -- Confidence grows with signal count
    LEAST(1.0, COUNT(*)::numeric / 10),
    COUNT(*)::int,
    NOW()
  FROM (
    -- ═══════════════════════════════════════════════════════════════
    -- FREE SIGNALS (NO DECAY - Current state or stable preferences)
    -- ═══════════════════════════════════════════════════════════════
    
    -- 1. Saves from couple_favorites (weight 1.0) - strongest signal, current state
    SELECT p.primary_category as category, 1.0 as weighted_score
    FROM couple_favorites cf
    JOIN places p ON p.id = cf.place_id
    WHERE cf.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 5. Explicit intent preferences (weight 0.8 per matched category) - stable until changed
    SELECT unnest(pd.maps_to_primary_categories) as category, 0.8 as weighted_score
    FROM user_preferences up
    CROSS JOIN LATERAL jsonb_array_elements_text(up.intent_preferences) as intent(val)
    JOIN preference_definitions pd ON pd.preference_key = intent.val AND pd.domain = 'intent'
    WHERE up.user_id = _user_id
      AND up.intent_preferences IS NOT NULL
      AND jsonb_array_length(up.intent_preferences) > 0
    
    UNION ALL
    
    -- 6. Event saves mapped to venue category (weight 0.6) - current state
    SELECT p.primary_category as category, 0.6 as weighted_score
    FROM event_favorites ef
    JOIN events e ON e.id = ef.event_id
    JOIN places p ON p.id = e.venue_place_id
    WHERE ef.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 8. Unsave place signals (negative weight -0.5) - no decay (keeps consistent impact)
    SELECT p.primary_category as category, -0.5 as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'unsave_place'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 8b. Unsave event signals (negative weight -0.4) - no decay (keeps consistent impact)
    -- Maps through event venue to get place category
    SELECT p.primary_category as category, -0.4 as weighted_score
    FROM user_signals us
    JOIN events e ON e.id::text = us.signal_key
    JOIN places p ON p.id = e.venue_place_id
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'unsave_event'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- ═══════════════════════════════════════════════════════════════
    -- FREE SIGNALS (WITH DECAY - Behavioral, time-sensitive)
    -- Decay formula: POWER(0.5, age_in_seconds / 90_days_in_seconds)
    -- At 90 days: 50% weight, At 180 days: 25% weight, etc.
    -- ═══════════════════════════════════════════════════════════════
    
    -- 2. View signals with 90-day half-life decay (weight 0.3 base)
    SELECT p.primary_category as category, 
           0.3 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_place'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 3. Click external signals with decay (weight 0.5 base)
    SELECT p.primary_category as category, 
           0.5 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'click_external'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 4. Filter category signals with decay (weight 0.4 base)
    SELECT us.signal_key as category, 
           0.4 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'filter_category'
      AND us.signal_key IS NOT NULL
    
    UNION ALL
    
    -- 7. Event views mapped to venue category with decay (weight 0.2 base)
    SELECT p.primary_category as category, 
           0.2 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN events e ON e.id::text = us.signal_key
    JOIN places p ON p.id = e.venue_place_id
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_event'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- Blog views mapped to linked place category with decay (weight 0.2 base)
    -- Uses context_json->>'place_id' for reliable place linking
    SELECT p.primary_category as category, 
           0.2 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id = (us.context_json->>'place_id')::uuid
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_blog_post'
      AND us.context_json->>'place_id' IS NOT NULL
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- ═══════════════════════════════════════════════════════════════
    -- PAID TUNING SIGNALS (NO DECAY - Already confidence-capped)
    -- These map via paid_tuning_definitions, never directly to categories
    -- ═══════════════════════════════════════════════════════════════
    
    -- 9. Context self-selected signals (capped weight up to 0.6)
    SELECT 
      unnest(ptd.maps_to_categories) as category, 
      LEAST(0.6, ptd.confidence_cap) as weighted_score
    FROM user_signals us
    JOIN paid_tuning_definitions ptd ON ptd.tuning_key = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'context_self_selected'
      AND us.signal_value = 'true'
      AND ptd.is_active = true
    
    UNION ALL
    
    -- 10. Activity pattern signals (capped weight up to 0.5)
    SELECT 
      unnest(ptd.maps_to_categories) as category, 
      LEAST(0.5, ptd.confidence_cap) as weighted_score
    FROM user_signals us
    JOIN paid_tuning_definitions ptd ON ptd.tuning_key = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'activity_pattern'
      AND us.signal_value = 'true'
      AND ptd.is_active = true
    
    UNION ALL
    
    -- 11. Interest cluster signals (capped weight up to 0.4)
    SELECT 
      unnest(ptd.maps_to_categories) as category, 
      LEAST(0.4, ptd.confidence_cap) as weighted_score
    FROM user_signals us
    JOIN paid_tuning_definitions ptd ON ptd.tuning_key = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'interest_cluster'
      AND us.signal_value = 'true'
      AND ptd.is_active = true
    
    UNION ALL
    
    -- 12. Environment preference signals (capped weight up to 0.3)
    SELECT 
      unnest(ptd.maps_to_categories) as category, 
      LEAST(0.3, ptd.confidence_cap) as weighted_score
    FROM user_signals us
    JOIN paid_tuning_definitions ptd ON ptd.tuning_key = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'environment_preference'
      AND us.signal_value = 'true'
      AND ptd.is_active = true
      
  ) as signals
  WHERE category IS NOT NULL
  GROUP BY category
  HAVING SUM(weighted_score) > 0  -- Only keep positive affinities
  ON CONFLICT (user_id, place_category)
  DO UPDATE SET
    affinity_score = EXCLUDED.affinity_score,
    confidence = EXCLUDED.confidence,
    supporting_signals_count = EXCLUDED.supporting_signals_count,
    last_updated = EXCLUDED.last_updated;
    
  -- Clean up negative/zero affinities that may have gone negative from unsaves
  DELETE FROM user_place_affinity
  WHERE user_id = _user_id AND affinity_score <= 0;
END;
$function$;