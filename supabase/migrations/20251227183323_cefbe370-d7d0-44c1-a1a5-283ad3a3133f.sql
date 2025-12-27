-- Phase 5: Places Infrastructure & Discovery Decoupling

-- 1. Create ENUMs for Places
CREATE TYPE affinity_type AS ENUM ('regular', 'occasional', 'aspirational');
CREATE TYPE place_cadence AS ENUM ('weekly', 'monthly', 'rare');

-- 2. Create places table (Canonical Registry)
CREATE TABLE places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id text UNIQUE NOT NULL,
  name text NOT NULL,
  primary_category text NOT NULL,
  secondary_categories text[],
  city text,
  state text,
  country text,
  lat numeric,
  lng numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_places_google_id ON places(google_place_id);
CREATE INDEX idx_places_city ON places(city);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read places"
ON places FOR SELECT TO authenticated
USING (true);

-- 3. Create member_place_affinities table (Atomic Signals)
CREATE TABLE member_place_affinities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  affinity_type affinity_type NOT NULL,
  cadence place_cadence NOT NULL,
  context text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX idx_member_affinities_user ON member_place_affinities(user_id);

ALTER TABLE member_place_affinities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affinities"
ON member_place_affinities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affinities"
ON member_place_affinities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affinities"
ON member_place_affinities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own affinities"
ON member_place_affinities FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create couple_place_signals table (Derived)
CREATE TABLE couple_place_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  shared_strength text NOT NULL,
  visibility text DEFAULT 'private',
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(couple_id, place_id)
);

CREATE INDEX idx_couple_signals_couple ON couple_place_signals(couple_id);

ALTER TABLE couple_place_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read signals"
ON couple_place_signals FOR SELECT
USING (
  couple_id IN (
    SELECT couple_id FROM member_profiles 
    WHERE user_id = auth.uid()
  )
);

-- 5. Create couple_location_summary table (Privacy Boundary)
CREATE TABLE couple_location_summary (
  couple_id uuid PRIMARY KEY REFERENCES couples(id) ON DELETE CASCADE,
  city text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'US',
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE couple_location_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read location summary"
ON couple_location_summary FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Couple members can insert own summary"
ON couple_location_summary FOR INSERT
WITH CHECK (
  couple_id IN (
    SELECT couple_id FROM member_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Couple members can update own summary"
ON couple_location_summary FOR UPDATE
USING (
  couple_id IN (
    SELECT couple_id FROM member_profiles 
    WHERE user_id = auth.uid()
  )
);

-- 6. Backfill couple_location_summary from existing member_profiles.city
INSERT INTO couple_location_summary (couple_id, city, country, last_updated)
SELECT DISTINCT ON (mp.couple_id)
  mp.couple_id,
  mp.city,
  'US',
  now()
FROM member_profiles mp
WHERE mp.city IS NOT NULL
  AND mp.couple_id IS NOT NULL
ON CONFLICT (couple_id) DO NOTHING;