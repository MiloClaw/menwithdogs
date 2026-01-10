-- Phase 1: Add unsave signal triggers and update affinity computation

-- Function to log unsave_place signal on DELETE
CREATE OR REPLACE FUNCTION public.log_unfavorite_as_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user_id from the couple (owner)
  SELECT mp.user_id INTO _user_id
  FROM member_profiles mp
  WHERE mp.couple_id = OLD.couple_id AND mp.is_owner = true
  LIMIT 1;

  IF _user_id IS NOT NULL THEN
    INSERT INTO user_signals (user_id, signal_type, signal_key, signal_value, source, confidence)
    VALUES (_user_id, 'unsave_place', OLD.place_id::text, 'false', 'user', 1.0);
  END IF;

  RETURN OLD;
END;
$$;

-- Function to log unsave_event signal on DELETE
CREATE OR REPLACE FUNCTION public.log_event_unfavorite_as_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT mp.user_id INTO _user_id
  FROM member_profiles mp
  WHERE mp.couple_id = OLD.couple_id AND mp.is_owner = true
  LIMIT 1;

  IF _user_id IS NOT NULL THEN
    INSERT INTO user_signals (user_id, signal_type, signal_key, signal_value, source, confidence)
    VALUES (_user_id, 'unsave_event', OLD.event_id::text, 'false', 'user', 1.0);
  END IF;

  RETURN OLD;
END;
$$;

-- Create DELETE triggers for unfavorite signals
CREATE TRIGGER on_couple_favorite_delete
  AFTER DELETE ON public.couple_favorites
  FOR EACH ROW
  EXECUTE FUNCTION log_unfavorite_as_signal();

CREATE TRIGGER on_event_favorite_delete
  AFTER DELETE ON public.event_favorites
  FOR EACH ROW
  EXECUTE FUNCTION log_event_unfavorite_as_signal();

-- Update compute_user_affinity to include events and unsave signals
CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  -- Signal weights: saves=1.0, event_saves=0.6, clicks=0.5, filters=0.4, views=0.3, event_views=0.2, explicit=0.8, unsaves=-0.5
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
    SELECT unnest(pd.maps_to_primary_categories) as category, 0.8 as weighted_score
    FROM user_preferences up
    CROSS JOIN LATERAL jsonb_array_elements_text(up.intent_preferences) as intent(val)
    JOIN preference_definitions pd ON pd.preference_key = intent.val AND pd.domain = 'intent'
    WHERE up.user_id = _user_id
      AND up.intent_preferences IS NOT NULL
      AND jsonb_array_length(up.intent_preferences) > 0
    
    UNION ALL
    
    -- 6. Event saves mapped to venue category (weight 0.6 - lower than direct place save)
    SELECT p.primary_category as category, 0.6 as weighted_score
    FROM event_favorites ef
    JOIN events e ON e.id = ef.event_id
    JOIN places p ON p.id = e.venue_place_id
    WHERE ef.couple_id = _couple_id 
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 7. Event views mapped to venue category (weight 0.2)
    SELECT p.primary_category as category, 0.2 as weighted_score
    FROM user_signals us
    JOIN events e ON e.id::text = us.signal_key
    JOIN places p ON p.id = e.venue_place_id
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'view_event'
      AND p.primary_category IS NOT NULL
    
    UNION ALL
    
    -- 8. Unsave place signals (negative weight -0.5)
    SELECT p.primary_category as category, -0.5 as weighted_score
    FROM user_signals us
    JOIN places p ON p.id::text = us.signal_key
    WHERE us.user_id = _user_id 
      AND us.signal_type = 'unsave_place'
      AND p.primary_category IS NOT NULL
      
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
$$;