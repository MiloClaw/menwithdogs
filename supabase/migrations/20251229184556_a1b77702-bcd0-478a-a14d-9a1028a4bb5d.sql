-- Step 0: Clean existing test data
DELETE FROM suggested_connections;
DELETE FROM couple_profile_drafts;
DELETE FROM couple_location_summary;
DELETE FROM couple_invites;
DELETE FROM member_profiles;
DELETE FROM couples;
DELETE FROM user_roles;

-- Step 1: Create interest_categories table
CREATE TABLE public.interest_categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  sort_order int DEFAULT 0,
  icon text
);

-- Enable RLS
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone authenticated can read categories
CREATE POLICY "Authenticated users can read interest categories"
ON public.interest_categories
FOR SELECT
USING (true);

-- RLS: Only admins can modify categories
CREATE POLICY "Admins can insert interest categories"
ON public.interest_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update interest categories"
ON public.interest_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete interest categories"
ON public.interest_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 2: Create interests table
CREATE TABLE public.interests (
  id text PRIMARY KEY,
  label text NOT NULL,
  category_id text NOT NULL REFERENCES public.interest_categories(id) ON DELETE CASCADE,
  google_mappings jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone authenticated can read interests
CREATE POLICY "Authenticated users can read interests"
ON public.interests
FOR SELECT
USING (true);

-- RLS: Only admins can modify interests
CREATE POLICY "Admins can insert interests"
ON public.interests
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update interests"
ON public.interests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete interests"
ON public.interests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 3: Create member_interests join table
CREATE TABLE public.member_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_id text NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- Enable RLS
ALTER TABLE public.member_interests ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own interests
CREATE POLICY "Users can read own member interests"
ON public.member_interests
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Users can insert their own interests
CREATE POLICY "Users can insert own member interests"
ON public.member_interests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can delete their own interests
CREATE POLICY "Users can delete own member interests"
ON public.member_interests
FOR DELETE
USING (auth.uid() = user_id);

-- Step 4: Create couple_interests join table
CREATE TABLE public.couple_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  interest_id text NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(couple_id, interest_id)
);

-- Enable RLS
ALTER TABLE public.couple_interests ENABLE ROW LEVEL SECURITY;

-- RLS: Couple members can read their couple's interests
CREATE POLICY "Couple members can read couple interests"
ON public.couple_interests
FOR SELECT
USING (couple_id = get_user_couple_id(auth.uid()));

-- RLS: Couple members can insert their couple's interests
CREATE POLICY "Couple members can insert couple interests"
ON public.couple_interests
FOR INSERT
WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

-- RLS: Couple members can delete their couple's interests
CREATE POLICY "Couple members can delete couple interests"
ON public.couple_interests
FOR DELETE
USING (couple_id = get_user_couple_id(auth.uid()));

-- Step 5: Drop old text[] columns
ALTER TABLE public.member_profiles DROP COLUMN IF EXISTS interests;
ALTER TABLE public.couples DROP COLUMN IF EXISTS shared_interests;

-- Step 6: Seed interest categories
INSERT INTO public.interest_categories (id, label, sort_order, icon) VALUES
  ('social', 'Social', 1, 'users'),
  ('outdoor', 'Outdoor & Adventure', 2, 'mountain'),
  ('food', 'Food & Drink', 3, 'utensils'),
  ('culture', 'Culture & Entertainment', 4, 'ticket'),
  ('wellness', 'Wellness & Relaxation', 5, 'heart'),
  ('games', 'Games & Activities', 6, 'gamepad');

-- Step 7: Seed interests with Google Place mappings
INSERT INTO public.interests (id, label, category_id, google_mappings, sort_order) VALUES
  -- Social (6)
  ('double-dates', 'Double dates', 'social', '[]'::jsonb, 1),
  ('dinner-parties', 'Dinner parties', 'social', '[{"type": "restaurant", "weight": 0.6}]'::jsonb, 2),
  ('game-nights', 'Game nights', 'social', '[{"type": "bar", "weight": 0.5, "keyword": "game"}]'::jsonb, 3),
  ('happy-hours', 'Happy hours', 'social', '[{"type": "bar", "weight": 1.0}]'::jsonb, 4),
  ('book-clubs', 'Book clubs', 'social', '[{"type": "book_store", "weight": 0.8}, {"type": "cafe", "weight": 0.5}]'::jsonb, 5),
  ('potlucks', 'Potlucks', 'social', '[]'::jsonb, 6),

  -- Outdoor & Adventure (6)
  ('hiking', 'Hiking', 'outdoor', '[{"type": "hiking_area", "weight": 1.0}, {"type": "park", "weight": 0.4, "keyword": "trail"}]'::jsonb, 1),
  ('camping', 'Camping', 'outdoor', '[{"type": "campground", "weight": 1.0}, {"type": "park", "weight": 0.3}]'::jsonb, 2),
  ('beach-days', 'Beach days', 'outdoor', '[{"type": "beach", "weight": 1.0}]'::jsonb, 3),
  ('biking', 'Biking', 'outdoor', '[{"type": "park", "weight": 0.6, "keyword": "bike"}, {"type": "bicycle_store", "weight": 0.4}]'::jsonb, 4),
  ('kayaking', 'Kayaking / paddleboarding', 'outdoor', '[{"type": "marina", "weight": 0.8}, {"type": "park", "weight": 0.4, "keyword": "kayak"}]'::jsonb, 5),
  ('picnics', 'Picnics', 'outdoor', '[{"type": "park", "weight": 1.0}]'::jsonb, 6),

  -- Food & Drink (6)
  ('trying-restaurants', 'Trying new restaurants', 'food', '[{"type": "restaurant", "weight": 1.0}]'::jsonb, 1),
  ('cooking-together', 'Cooking together', 'food', '[{"type": "cooking_class", "weight": 1.0}, {"type": "grocery_or_supermarket", "weight": 0.3}]'::jsonb, 2),
  ('wine-tasting', 'Wine tasting', 'food', '[{"type": "bar", "weight": 0.8, "keyword": "wine"}, {"type": "winery", "weight": 1.0}]'::jsonb, 3),
  ('craft-beer', 'Craft beer', 'food', '[{"type": "bar", "weight": 1.0, "keyword": "craft beer"}, {"type": "brewery", "weight": 1.0}]'::jsonb, 4),
  ('craft-coffee', 'Craft coffee', 'food', '[{"type": "cafe", "weight": 1.0, "keyword": "specialty coffee"}]'::jsonb, 5),
  ('farmers-markets', 'Farmers markets', 'food', '[{"type": "grocery_or_supermarket", "weight": 0.6, "keyword": "farmers market"}]'::jsonb, 6),

  -- Culture & Entertainment (6)
  ('live-music', 'Live music', 'culture', '[{"type": "night_club", "weight": 0.8}, {"type": "bar", "weight": 0.6, "keyword": "live music"}]'::jsonb, 1),
  ('live-comedy', 'Live comedy', 'culture', '[{"type": "night_club", "weight": 0.8, "keyword": "comedy club"}]'::jsonb, 2),
  ('theater', 'Theater', 'culture', '[{"type": "movie_theater", "weight": 0.4}, {"type": "performing_arts_theater", "weight": 1.0}]'::jsonb, 3),
  ('museums', 'Museums', 'culture', '[{"type": "museum", "weight": 1.0}, {"type": "art_gallery", "weight": 0.8}]'::jsonb, 4),
  ('movies', 'Movies', 'culture', '[{"type": "movie_theater", "weight": 1.0}]'::jsonb, 5),
  ('trivia-nights', 'Trivia nights', 'culture', '[{"type": "bar", "weight": 0.8, "keyword": "trivia"}]'::jsonb, 6),

  -- Wellness & Relaxation (3)
  ('yoga', 'Yoga', 'wellness', '[{"type": "gym", "weight": 0.8, "keyword": "yoga"}, {"type": "spa", "weight": 0.4}]'::jsonb, 1),
  ('spa-days', 'Spa days', 'wellness', '[{"type": "spa", "weight": 1.0}]'::jsonb, 2),
  ('meditation', 'Meditation', 'wellness', '[{"type": "gym", "weight": 0.5, "keyword": "meditation"}, {"type": "spa", "weight": 0.6}]'::jsonb, 3),

  -- Games & Activities (3)
  ('board-games', 'Board games', 'games', '[{"type": "cafe", "weight": 0.6, "keyword": "board game"}]'::jsonb, 1),
  ('bowling', 'Bowling', 'games', '[{"type": "bowling_alley", "weight": 1.0}]'::jsonb, 2),
  ('escape-rooms', 'Escape rooms', 'games', '[{"type": "amusement_park", "weight": 0.4, "keyword": "escape room"}]'::jsonb, 3);