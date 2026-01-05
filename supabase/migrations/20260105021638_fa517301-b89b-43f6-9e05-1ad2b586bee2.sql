-- =============================================
-- LAYER 1: user_signals - Immutable Event Log
-- =============================================
CREATE TABLE public.user_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- What happened
  signal_type text NOT NULL, -- 'save_place', 'save_event', 'view_place', 'explicit_preference', 'follow_taxonomy'
  signal_key text NOT NULL,  -- 'coffee', place_id, event_id, 'time_preference'
  signal_value text,         -- 'morning', 'true', null for implicit
  
  -- Context
  source text NOT NULL DEFAULT 'user',       -- 'user', 'system', 'import', 'derived'
  confidence numeric DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  context_json jsonb,                         -- Optional metadata (city, session, etc.)
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for query patterns
CREATE INDEX idx_user_signals_user_type ON user_signals(user_id, signal_type);
CREATE INDEX idx_user_signals_created ON user_signals(created_at DESC);
CREATE INDEX idx_user_signals_key ON user_signals(signal_key);

-- RLS
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own signals"
  ON user_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own signals"
  ON user_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all signals"
  ON user_signals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- LAYER 2: user_preference_profiles - Interpreted Preferences
-- =============================================
CREATE TABLE public.user_preference_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Preference dimensions
  preference_domain text NOT NULL,  -- 'activity', 'lifestyle', 'time', 'budget', 'social_energy'
  preference_key text NOT NULL,     -- 'coffee', 'fitness', 'morning', 'budget_conscious'
  
  -- Computed values
  weight numeric NOT NULL DEFAULT 0.5 CHECK (weight >= 0 AND weight <= 1),
  confidence numeric DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  derived_from text NOT NULL DEFAULT 'explicit', -- 'explicit', 'implicit', 'blended'
  
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, preference_domain, preference_key)
);

CREATE INDEX idx_pref_profiles_user ON user_preference_profiles(user_id);
CREATE INDEX idx_pref_profiles_domain ON user_preference_profiles(preference_domain);

ALTER TABLE user_preference_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preference profiles"
  ON user_preference_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preference profiles"
  ON user_preference_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all preference profiles"
  ON user_preference_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- LAYER 3: user_place_affinity - Category-Level Intelligence
-- =============================================
CREATE TABLE public.user_place_affinity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- What category (maps to taxonomy_nodes or primary_category)
  place_category text NOT NULL,    -- 'coffee_shop', 'wine_bar', 'gym'
  taxonomy_node_id uuid REFERENCES taxonomy_nodes(id),
  
  -- Computed affinity
  affinity_score numeric NOT NULL DEFAULT 0.5 CHECK (affinity_score >= 0 AND affinity_score <= 1),
  confidence numeric DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  supporting_signals_count int DEFAULT 0,
  
  last_updated timestamptz DEFAULT now(),
  
  UNIQUE(user_id, place_category)
);

CREATE INDEX idx_affinity_user ON user_place_affinity(user_id);
CREATE INDEX idx_affinity_category ON user_place_affinity(place_category);

ALTER TABLE user_place_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affinity"
  ON user_place_affinity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own affinity"
  ON user_place_affinity FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affinity"
  ON user_place_affinity FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- LAYER 4: preference_definitions - Controlled Vocabulary
-- =============================================
CREATE TABLE public.preference_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  preference_key text NOT NULL UNIQUE,
  domain text NOT NULL,                    -- 'time', 'distance', 'vibe', 'intent', 'activity'
  label text NOT NULL,                     -- Display label
  description text,
  
  -- Mapping to places
  maps_to_taxonomy_slugs text[] DEFAULT '{}',
  maps_to_primary_categories text[] DEFAULT '{}',
  
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pref_def_domain ON preference_definitions(domain);

ALTER TABLE preference_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active definitions"
  ON preference_definitions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage definitions"
  ON preference_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial definitions
INSERT INTO preference_definitions (preference_key, domain, label, description, sort_order) VALUES
  ('morning', 'time', 'Morning', 'I prefer morning activities', 1),
  ('afternoon', 'time', 'Afternoon', 'I prefer afternoon activities', 2),
  ('evening', 'time', 'Evening', 'I prefer evening activities', 3),
  ('flexible', 'time', 'Flexible', 'Any time works for me', 4),
  ('walking', 'distance', 'Walking distance', 'Within 15 minutes', 1),
  ('short_drive', 'distance', 'Short drive', '15-30 minutes', 2),
  ('worth_the_trip', 'distance', 'Worth the trip', '30+ minutes', 3),
  ('anywhere', 'distance', 'Anywhere', 'Distance does not matter', 4),
  ('chill', 'vibe', 'Chill', 'Low-key, relaxed atmosphere', 1),
  ('lively', 'vibe', 'Lively', 'Energetic, social atmosphere', 2),
  ('mixed', 'vibe', 'Depends', 'Varies by mood', 3),
  ('date_night', 'intent', 'Date night', 'Romantic outings', 1),
  ('explore_new', 'intent', 'Explore new', 'Discovering new places', 2),
  ('regular_spot', 'intent', 'Regular spot', 'Finding go-to favorites', 3),
  ('special_occasion', 'intent', 'Special occasion', 'Celebrations and milestones', 4);

-- =============================================
-- Helper Function: Record User Signal
-- =============================================
CREATE OR REPLACE FUNCTION public.record_user_signal(
  _signal_type text,
  _signal_key text,
  _signal_value text DEFAULT NULL,
  _source text DEFAULT 'user',
  _confidence numeric DEFAULT 1.0,
  _context jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _signal_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO user_signals (user_id, signal_type, signal_key, signal_value, source, confidence, context_json)
  VALUES (_user_id, _signal_type, _signal_key, _signal_value, _source, _confidence, _context)
  RETURNING id INTO _signal_id;

  RETURN _signal_id;
END;
$$;

-- =============================================
-- Trigger: Log Favorites as Signals
-- =============================================
CREATE OR REPLACE FUNCTION public.log_favorite_as_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user_id from the couple (owner)
  SELECT mp.user_id INTO _user_id
  FROM member_profiles mp
  WHERE mp.couple_id = NEW.couple_id AND mp.is_owner = true
  LIMIT 1;

  IF _user_id IS NOT NULL THEN
    INSERT INTO user_signals (user_id, signal_type, signal_key, signal_value, source)
    VALUES (_user_id, 'save_place', NEW.place_id::text, 'true', 'user');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_couple_favorite_insert
  AFTER INSERT ON couple_favorites
  FOR EACH ROW
  EXECUTE FUNCTION log_favorite_as_signal();

-- Trigger for event favorites
CREATE OR REPLACE FUNCTION public.log_event_favorite_as_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT mp.user_id INTO _user_id
  FROM member_profiles mp
  WHERE mp.couple_id = NEW.couple_id AND mp.is_owner = true
  LIMIT 1;

  IF _user_id IS NOT NULL THEN
    INSERT INTO user_signals (user_id, signal_type, signal_key, signal_value, source)
    VALUES (_user_id, 'save_event', NEW.event_id::text, 'true', 'user');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_favorite_insert
  AFTER INSERT ON event_favorites
  FOR EACH ROW
  EXECUTE FUNCTION log_event_favorite_as_signal();