-- ============================================================
-- PRO CONTEXT DENSITY INTELLIGENCE - PHASE 2: REBUILD RPC
-- Aggregates Pro context signals into anonymous place-level density
-- ============================================================

CREATE OR REPLACE FUNCTION public.rebuild_place_context_density(_city_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  -- Decay configuration
  _signal_decay_seconds constant numeric := 180 * 24 * 3600;  -- 180-day half-life for user signals
  _prior_decay_seconds constant numeric := 90 * 24 * 3600;   -- 90-day half-life for admin priors
  
  -- K-anonymity thresholds
  _default_k constant int := 10;
  _sensitive_k constant int := 20;
BEGIN
  -- ═══════════════════════════════════════════════════════════════
  -- STEP 1: Compute density from Pro user context signals + favorites
  -- 
  -- Logic:
  -- 1. Find all Pro users who have emitted pro_context signals
  -- 2. Join with their couple_favorites to get places they engage with
  -- 3. Apply 180-day decay to signal contribution
  -- 4. Aggregate per (place, city, context)
  -- 5. Check k-anonymity threshold
  -- 6. Set density_score = 0 if below threshold
  -- ═══════════════════════════════════════════════════════════════
  
  -- Clear existing density for scope (full rebuild approach)
  IF _city_id IS NOT NULL THEN
    DELETE FROM place_context_density WHERE city_id = _city_id;
  ELSE
    DELETE FROM place_context_density;
  END IF;
  
  -- Insert fresh density calculations
  INSERT INTO place_context_density (place_id, city_id, context_key, density_score, meets_k_threshold, last_updated)
  SELECT 
    agg.place_id,
    agg.city_id,
    agg.context_key,
    -- Density score: average decayed contribution (only if threshold met)
    CASE 
      WHEN agg.distinct_users >= CASE WHEN pcd.is_sensitive THEN _sensitive_k ELSE _default_k END 
      THEN LEAST(1.0, agg.total_weight / GREATEST(1, agg.distinct_users))
      ELSE 0
    END as density_score,
    -- Threshold met?
    agg.distinct_users >= CASE WHEN pcd.is_sensitive THEN _sensitive_k ELSE _default_k END as meets_k_threshold,
    NOW()
  FROM (
    -- Aggregate: for each (place, city, context), count distinct users and sum decayed weights
    SELECT 
      p.id as place_id,
      c.id as city_id,
      us.signal_key as context_key,
      COUNT(DISTINCT us.user_id) as distinct_users,
      SUM(
        -- Apply 180-day half-life decay to each user's contribution
        POWER(0.5, EXTRACT(EPOCH FROM (NOW() - us.created_at)) / _signal_decay_seconds)
      ) as total_weight
    FROM user_signals us
    -- Join with member_profiles to get couple_id
    JOIN member_profiles mp ON mp.user_id = us.user_id AND mp.is_owner = true
    -- Join with couple_favorites to find places this user engaged with
    JOIN couple_favorites cf ON cf.couple_id = mp.couple_id
    -- Get place details
    JOIN places p ON p.id = cf.place_id AND p.status = 'approved'
    -- Get city
    JOIN cities c ON p.city = c.name AND c.status = 'launched'
    WHERE us.signal_type = 'pro_context'
      AND us.source = 'pro_user'
      -- Only signals within 180-day window (optimization)
      AND us.created_at > NOW() - INTERVAL '180 days'
      -- City filter if provided
      AND (_city_id IS NULL OR c.id = _city_id)
    GROUP BY p.id, c.id, us.signal_key
  ) agg
  -- Join to get is_sensitive flag
  JOIN pro_context_definitions pcd ON pcd.key = agg.context_key AND pcd.is_active = true;
  
  -- ═══════════════════════════════════════════════════════════════
  -- STEP 2: Seed with admin priors where density is absent/weak
  -- 
  -- Admin priors provide early value before real signal density builds.
  -- They use a faster 90-day decay and are capped at 0.25.
  -- ═══════════════════════════════════════════════════════════════
  
  INSERT INTO place_context_density (place_id, city_id, context_key, density_score, meets_k_threshold, last_updated)
  SELECT 
    pcp.place_id,
    pcp.city_id,
    pcp.context_key,
    -- Admin prior score with 90-day decay, capped
    LEAST(0.25, pcp.confidence * POWER(0.5, EXTRACT(EPOCH FROM (NOW() - pcp.created_at)) / _prior_decay_seconds)),
    false, -- Priors never meet k-threshold (they're scaffolding)
    NOW()
  FROM place_context_priors pcp
  JOIN pro_context_definitions pcd ON pcd.key = pcp.context_key AND pcd.is_active = true
  WHERE (_city_id IS NULL OR pcp.city_id = _city_id)
  -- Only insert where we don't already have real density
  ON CONFLICT (place_id, context_key) DO NOTHING;
  
END;
$$;

-- Grant execute to service role only (admins trigger via UI)
REVOKE ALL ON FUNCTION public.rebuild_place_context_density(uuid) FROM PUBLIC;

COMMENT ON FUNCTION public.rebuild_place_context_density IS 
  'Rebuilds place_context_density table from Pro user context signals and admin priors. 
   Applies k-anonymity (10 default, 20 for sensitive), 180-day signal decay, 90-day prior decay.
   Safe to call repeatedly - fully recomputes from source signals.';