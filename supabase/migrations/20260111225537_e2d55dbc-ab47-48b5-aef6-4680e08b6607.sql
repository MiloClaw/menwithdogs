-- Fix compute_user_affinity to validate auth.uid() matches _user_id
-- This prevents users from computing affinity for other users

CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid, _is_pro boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _couple_id uuid;
  _decay_half_life_days constant numeric := 90;
  _decay_seconds constant numeric := 90 * 24 * 3600;
  _context_decay_seconds constant numeric := 180 * 24 * 3600;
  _prior_decay_seconds constant numeric := 90 * 24 * 3600;
  _caller_id uuid;
BEGIN
  -- SECURITY: Validate that caller can only compute their own affinity (or is admin)
  _caller_id := auth.uid();
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF _user_id != _caller_id AND NOT has_role(_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: can only compute own affinity';
  END IF;

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
    LEAST(1.0, GREATEST(0, SUM(weighted_score) / GREATEST(1, COUNT(*) * 0.5))),
    LEAST(1.0, COUNT(*)::numeric / 10),
    COUNT(*)::int,
    NOW()
  FROM (
    -- FREE SIGNALS (NO DECAY)
    SELECT p.primary_category as category, 1.0 as weighted_score
    FROM couple_favorites cf
    JOIN places p ON p.id = cf.place_id
    WHERE cf.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT unnest(pd.maps_to_primary_categories) as category, 0.8 as weighted_score
    FROM user_preferences up
    CROSS JOIN LATERAL jsonb_array_elements_text(up.intent_preferences) as intent(val)
    JOIN preference_definitions pd ON pd.preference_key = intent.val AND pd.domain = 'intent'
    WHERE up.user_id = _user_id
      AND up.intent_preferences IS NOT NULL
      AND jsonb_array_length(up.intent_preferences) > 0
    
    UNION ALL
    
    SELECT p.primary_category as category, 0.6 as weighted_score
    FROM event_favorites ef
    JOIN events e ON e.id = ef.event_id
    JOIN places p ON p.id = e.venue_place_id
    WHERE ef.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT p.primary_category as category, -0.5 as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'unsave_place'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT p.primary_category as category, -0.4 as weighted_score
    FROM user_signals us
    JOIN events e ON e.id::text = us.signal_key
    JOIN places p ON p.id = e.venue_place_id
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'unsave_event'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- FREE SIGNALS (WITH DECAY)
    SELECT p.primary_category as category, 
           0.3 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_place'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT p.primary_category as category, 
           0.5 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'click_external'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT us.signal_key as category, 
           0.4 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'filter_category'
      AND us.signal_key IS NOT NULL
    
    UNION ALL
    
    SELECT p.primary_category as category, 
           0.2 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN events e ON e.id::text = us.signal_key
    JOIN places p ON p.id = e.venue_place_id
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_event'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT p.primary_category as category, 
           0.2 * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _decay_seconds) as weighted_score
    FROM user_signals us
    JOIN places p ON p.id = (us.context_json->>'place_id')::uuid
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_blog_post'
      AND us.context_json->>'place_id' IS NOT NULL
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- PAID TUNING SIGNALS
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
    
    SELECT 
      unnest(ptd.maps_to_categories) as category, 
      LEAST(0.3, ptd.confidence_cap) as weighted_score
    FROM user_signals us
    JOIN paid_tuning_definitions ptd ON ptd.tuning_key = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'environment_preference'
      AND us.signal_value = 'true'
      AND ptd.is_active = true
    
    UNION ALL
    
    -- PRO CONTEXT DENSITY SIGNALS (PRO ONLY)
    SELECT 
      p.primary_category as category,
      LEAST(0.2, 
        pcd.density_score * 
        POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _context_decay_seconds) *
        0.3
      ) as weighted_score
    FROM user_signals us
    JOIN pro_context_definitions pctx ON pctx.key = us.signal_key AND pctx.is_active = true
    JOIN place_context_density pcd ON pcd.context_key = us.signal_key AND pcd.meets_k_threshold = true
    JOIN places p ON p.id = pcd.place_id AND p.status = 'approved'
    WHERE us.user_id = _user_id
      AND us.signal_type = 'pro_context'
      AND us.source = 'pro_user'
      AND _is_pro = true
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    SELECT 
      p.primary_category as category,
      LEAST(0.1, 
        pcp.confidence * 
        POWER(0.5, EXTRACT(EPOCH FROM (NOW() - pcp.created_at)) / _prior_decay_seconds) *
        POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _context_decay_seconds) *
        0.2
      ) as weighted_score
    FROM user_signals us
    JOIN pro_context_definitions pctx ON pctx.key = us.signal_key AND pctx.is_active = true
    JOIN place_context_priors pcp ON pcp.context_key = us.signal_key
    JOIN places p ON p.id = pcp.place_id AND p.status = 'approved'
    LEFT JOIN place_context_density pcd ON pcd.place_id = pcp.place_id AND pcd.context_key = pcp.context_key AND pcd.meets_k_threshold = true
    WHERE us.user_id = _user_id
      AND us.signal_type = 'pro_context'
      AND us.source = 'pro_user'
      AND _is_pro = true
      AND pcd.id IS NULL
      AND p.primary_category IS NOT NULL
      
  ) as signals
  WHERE category IS NOT NULL
  GROUP BY category
  HAVING SUM(weighted_score) > 0
  ON CONFLICT (user_id, place_category)
  DO UPDATE SET
    affinity_score = EXCLUDED.affinity_score,
    confidence = EXCLUDED.confidence,
    supporting_signals_count = EXCLUDED.supporting_signals_count,
    last_updated = EXCLUDED.last_updated;
    
  DELETE FROM user_place_affinity
  WHERE user_id = _user_id AND affinity_score <= 0;
END;
$function$;