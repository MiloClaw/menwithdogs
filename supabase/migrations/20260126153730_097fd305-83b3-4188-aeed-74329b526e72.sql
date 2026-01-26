-- ============================================================
-- Phase 2: Community Tag System
-- Tables: canonical_tags, tag_signals, place_tag_aggregates, tag_suggestions
-- ============================================================

-- Table 1: canonical_tags (Admin-controlled vocabulary)
CREATE TABLE public.canonical_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('culture', 'accessibility', 'social', 'outdoor')),
  description text,
  is_sensitive boolean DEFAULT false,
  applicable_google_types text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Table 2: tag_signals (Append-only user signals)
CREATE TABLE public.tag_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  tag_slug text NOT NULL REFERENCES public.canonical_tags(slug) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('add', 'remove')),
  created_at timestamptz DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_tag_signals_place_tag ON public.tag_signals(place_id, tag_slug);
CREATE INDEX idx_tag_signals_user ON public.tag_signals(user_id);

-- Table 3: place_tag_aggregates (Computed, disposable)
CREATE TABLE public.place_tag_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  tag_slug text NOT NULL REFERENCES public.canonical_tags(slug) ON DELETE CASCADE,
  unique_taggers integer NOT NULL DEFAULT 0,
  meets_k_threshold boolean NOT NULL DEFAULT false,
  last_computed timestamptz DEFAULT now(),
  UNIQUE (place_id, tag_slug)
);

-- Index for public queries
CREATE INDEX idx_place_tag_aggregates_visible ON public.place_tag_aggregates(place_id) WHERE meets_k_threshold = true;

-- Table 4: tag_suggestions (Moderation queue)
CREATE TABLE public.tag_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_label text NOT NULL,
  suggested_category text CHECK (suggested_category IN ('culture', 'accessibility', 'social', 'outdoor')),
  rationale text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  merged_into_slug text REFERENCES public.canonical_tags(slug),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.canonical_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_tag_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_suggestions ENABLE ROW LEVEL SECURITY;

-- canonical_tags policies
CREATE POLICY "Public read active canonical tags"
ON public.canonical_tags FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin manage canonical tags"
ON public.canonical_tags FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- tag_signals policies
CREATE POLICY "Users can insert own tag signals"
ON public.tag_signals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tag signals"
ON public.tag_signals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin read all tag signals"
ON public.tag_signals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- place_tag_aggregates policies
CREATE POLICY "Public read visible aggregates"
ON public.place_tag_aggregates FOR SELECT
USING (meets_k_threshold = true);

CREATE POLICY "Admin read all aggregates"
ON public.place_tag_aggregates FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage aggregates"
ON public.place_tag_aggregates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- tag_suggestions policies
CREATE POLICY "Users can submit tag suggestions"
ON public.tag_suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own suggestions"
ON public.tag_suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin manage all suggestions"
ON public.tag_suggestions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Aggregation Function (Security Definer, Rebuildable)
-- ============================================================

CREATE OR REPLACE FUNCTION public.compute_tag_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k_default INTEGER := 3;
  k_sensitive INTEGER := 5;
BEGIN
  -- Clear and recompute (rebuildable interpretation)
  TRUNCATE public.place_tag_aggregates;
  
  INSERT INTO public.place_tag_aggregates (place_id, tag_slug, unique_taggers, meets_k_threshold, last_computed)
  SELECT 
    ts.place_id,
    ts.tag_slug,
    COUNT(DISTINCT ts.user_id) as unique_taggers,
    CASE 
      WHEN ct.is_sensitive THEN COUNT(DISTINCT ts.user_id) >= k_sensitive
      ELSE COUNT(DISTINCT ts.user_id) >= k_default
    END as meets_k_threshold,
    NOW()
  FROM public.tag_signals ts
  JOIN public.canonical_tags ct ON ct.slug = ts.tag_slug AND ct.is_active = true
  WHERE ts.action = 'add'
    -- Only count if user's latest action for this tag is 'add'
    AND NOT EXISTS (
      SELECT 1 FROM public.tag_signals ts_remove
      WHERE ts_remove.user_id = ts.user_id
        AND ts_remove.place_id = ts.place_id
        AND ts_remove.tag_slug = ts.tag_slug
        AND ts_remove.action = 'remove'
        AND ts_remove.created_at > ts.created_at
    )
  GROUP BY ts.place_id, ts.tag_slug, ct.is_sensitive;
END;
$$;

-- ============================================================
-- Seed Data: Initial Canonical Tags
-- ============================================================

INSERT INTO public.canonical_tags (slug, label, category, description, is_sensitive, applicable_google_types) VALUES
('lgbtq_friendly', 'LGBTQ+ Friendly', 'culture', 'Welcoming to the LGBTQ+ community', false, ARRAY['bar', 'night_club', 'restaurant', 'cafe', 'park']),
('bear_crowd', 'Bear Crowd', 'culture', 'Popular with the bear community', false, ARRAY['bar', 'night_club', 'cafe']),
('leather_scene', 'Leather Scene', 'culture', 'Known for leather and kink community', true, ARRAY['bar', 'night_club']),
('clothing_optional', 'Clothing Optional', 'outdoor', 'Clothing optional areas available', true, ARRAY['park', 'beach', 'spa', 'resort']),
('cruisy_vibes', 'Cruisy Vibes', 'social', 'Known for cruising activity', true, ARRAY['park', 'beach', 'gym']),
('quiet_weekdays', 'Quiet on Weekdays', 'social', 'Less crowded during the week', false, ARRAY['cafe', 'restaurant', 'bar', 'park', 'museum']),
('good_for_groups', 'Good for Groups', 'social', 'Great for larger gatherings', false, ARRAY['restaurant', 'bar', 'park', 'bowling_alley', 'amusement_park']),
('dog_friendly', 'Dog Friendly', 'accessibility', 'Dogs are welcome', false, ARRAY['cafe', 'restaurant', 'bar', 'park', 'beach', 'store']),
('wheelchair_accessible', 'Wheelchair Accessible', 'accessibility', 'Full wheelchair accessibility', false, ARRAY[]::text[]),
('sunrise_spot', 'Great for Sunrise', 'outdoor', 'Excellent sunrise viewing location', false, ARRAY['park', 'beach', 'viewpoint', 'hiking_area']),
('sunset_views', 'Great for Sunset', 'outdoor', 'Excellent sunset viewing location', false, ARRAY['park', 'beach', 'viewpoint', 'rooftop_bar', 'restaurant']),
('picnic_friendly', 'Picnic Friendly', 'outdoor', 'Great spot for a picnic', false, ARRAY['park', 'beach', 'botanical_garden', 'zoo']);