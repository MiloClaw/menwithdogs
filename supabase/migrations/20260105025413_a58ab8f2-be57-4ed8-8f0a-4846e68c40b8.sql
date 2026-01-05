-- Create function to compute user affinity from behavioral signals
CREATE OR REPLACE FUNCTION public.compute_user_affinity(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _couple_id uuid;
BEGIN
  -- Get user's couple
  SELECT couple_id INTO _couple_id
  FROM member_profiles
  WHERE user_id = _user_id AND is_owner = true
  LIMIT 1;
  
  IF _couple_id IS NULL THEN RETURN; END IF;
  
  -- Compute and upsert affinities from saved places
  INSERT INTO user_place_affinity (user_id, place_category, affinity_score, confidence, supporting_signals_count, last_updated)
  SELECT 
    _user_id,
    p.primary_category,
    -- Normalize: log scale to prevent one category dominating
    LEAST(1.0, LOG(1 + COUNT(*)::numeric) / LOG(1 + 10)),
    LEAST(1.0, COUNT(*)::numeric / 5), -- Confidence grows with count
    COUNT(*)::int,
    NOW()
  FROM couple_favorites cf
  JOIN places p ON p.id = cf.place_id
  WHERE cf.couple_id = _couple_id
    AND p.primary_category IS NOT NULL
  GROUP BY p.primary_category
  ON CONFLICT (user_id, place_category)
  DO UPDATE SET
    affinity_score = EXCLUDED.affinity_score,
    confidence = EXCLUDED.confidence,
    supporting_signals_count = EXCLUDED.supporting_signals_count,
    last_updated = EXCLUDED.last_updated;
END;
$$;

-- Add unique constraint for upsert to work
CREATE UNIQUE INDEX IF NOT EXISTS user_place_affinity_user_category_idx 
ON user_place_affinity(user_id, place_category);