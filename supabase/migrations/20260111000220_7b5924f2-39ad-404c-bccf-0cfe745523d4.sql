-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 3: PAID TUNING + SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'active', 'canceled', 'past_due')),
  plan_id text DEFAULT 'pro_monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "System can manage subscriptions"
  ON subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- INVARIANT COMMENT (Sanity Check Fix #1)
COMMENT ON TABLE subscriptions IS
'Stripe-backed entitlements only. 
Must never be joined into intelligence, affinity, or ranking logic.
Stripe failure must never degrade recommendations - only gate access.';

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Create paid_tuning_definitions table
CREATE TABLE public.paid_tuning_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL CHECK (domain IN ('context', 'activity', 'interest', 'environment')),
  tuning_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  icon text,
  maps_to_categories text[] NOT NULL, -- Refinement #1: NOT NULL enforced
  confidence_cap numeric DEFAULT 0.3, -- Sanity Check Fix #4
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS for paid_tuning_definitions
ALTER TABLE paid_tuning_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active definitions"
  ON paid_tuning_definitions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage definitions"
  ON paid_tuning_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE paid_tuning_definitions IS
'Defines paid tuning options that map to place categories.
confidence_cap limits how much each paid signal can influence affinity.
All tuning must resolve to Google Place categories via maps_to_categories.';

-- 3. Seed paid_tuning_definitions
INSERT INTO paid_tuning_definitions 
  (domain, tuning_key, label, description, icon, maps_to_categories, confidence_cap, sort_order) 
VALUES
  -- Context (self-selected identity signals)
  ('context', 'lgbtq_friendly', 'LGBTQ+ friendly', 'Places known for being welcoming', '🏳️‍🌈', 
   ARRAY['Bar', 'Cafe', 'Restaurant', 'Night Club'], 0.3, 1),
  ('context', 'family_friendly', 'Family-friendly', 'Places that work well with children', '👨‍👩‍👧', 
   ARRAY['Restaurant', 'Park', 'Cafe', 'Museum', 'Zoo'], 0.3, 2),
  
  -- Activity (hobby/routine patterns)
  ('activity', 'morning_active', 'Morning active', 'Early parks and trails', '🌅', 
   ARRAY['Park', 'Hiking Area', 'Gym'], 0.25, 1),
  ('activity', 'live_music', 'Live music lover', 'Venues with live performances', '🎵', 
   ARRAY['Bar', 'Night Club', 'Performing Arts Theater', 'Concert Hall'], 0.25, 2),
  ('activity', 'weekend_brunch', 'Weekend brunch', 'Brunch spots and cafes', '🥞', 
   ARRAY['Restaurant', 'Cafe', 'Brunch Restaurant'], 0.25, 3),
  
  -- Environment (lifestyle modifiers)
  ('environment', 'dog_friendly', 'Dog-friendly', 'Places that welcome dogs', '🐕', 
   ARRAY['Park', 'Cafe', 'Restaurant', 'Bar'], 0.2, 1),
  ('environment', 'outdoor_seating', 'Outdoor seating', 'Prefer patios and terraces', '☀️', 
   ARRAY['Restaurant', 'Cafe', 'Bar'], 0.2, 2),
  ('environment', 'quiet_atmosphere', 'Quiet atmosphere', 'Calm, conversation-friendly', '🤫', 
   ARRAY['Cafe', 'Restaurant', 'Bookstore', 'Library'], 0.2, 3);

-- 4. Add overlap_boost placeholder to user_place_affinity
ALTER TABLE user_place_affinity 
ADD COLUMN IF NOT EXISTS overlap_boost numeric DEFAULT 0;

COMMENT ON COLUMN user_place_affinity.overlap_boost IS 
'Phase 4 placeholder: Boost from users with similar signal patterns. 
Not computed yet. When implemented:
- Must never override personal signals, only augment
- Capped at 0.3 maximum influence
- Computed via batch job, not real-time
- Invisible to users per Rule 7';

-- 5. Update compute_user_affinity function with paid signal support
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
    -- FREE SIGNALS
    -- ═══════════════════════════════════════════════════════════════
    
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
    
    -- 6. Event saves mapped to venue category (weight 0.6)
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
    
    UNION ALL
    
    -- ═══════════════════════════════════════════════════════════════
    -- PAID TUNING SIGNALS (Sanity Check Fix #3: Indirect Mapping)
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
$$;

-- Update function comment with paid signal weights
COMMENT ON FUNCTION public.compute_user_affinity IS 
'Recomputes user affinity scores from raw signals. 

FREE SIGNAL WEIGHTS:
- save_place: 1.0 (strong positive)
- click_external: 0.5 (active engagement)
- filter_category: 0.4 (active interest)
- view_place: 0.3 (passive)
- explicit_preference: 0.8 (user stated, via preference_definitions)
- unsave_place: -0.5 (negative feedback)
- save_event: 0.6 (strong, mapped to venue)
- view_event: 0.2 (passive, mapped to venue)

PAID SIGNAL WEIGHTS (capped by confidence_cap):
- context_self_selected: up to 0.6 (identity context)
- activity_pattern: up to 0.5 (hobby/routine)
- interest_cluster: up to 0.4 (community affinity)
- environment_preference: up to 0.3 (lifestyle modifier)

INVARIANTS:
- This function can be safely re-run at any time
- Output is disposable and can be deleted/rebuilt
- Weights may be tuned without schema changes
- No filtering occurs here - only scoring
- Paid signals MUST map via paid_tuning_definitions, never directly';