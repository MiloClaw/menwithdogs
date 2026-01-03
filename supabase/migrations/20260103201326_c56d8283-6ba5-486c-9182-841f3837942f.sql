-- Create city status enum
CREATE TYPE city_status AS ENUM ('draft', 'launched', 'paused');

-- Create cities table for controlled city rollouts
CREATE TABLE public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'US',
  status city_status NOT NULL DEFAULT 'draft',
  
  -- Seeding targets
  target_place_count smallint NOT NULL DEFAULT 30,
  target_anchor_count smallint NOT NULL DEFAULT 15,
  
  -- Launch audit
  launched_at timestamptz,
  launched_by uuid,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique city per state/country
  CONSTRAINT cities_unique_location UNIQUE (name, state, country)
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (cities are internal curation tools)
CREATE POLICY "Admins can read all cities"
  ON public.cities FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cities"
  ON public.cities FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cities"
  ON public.cities FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cities"
  ON public.cities FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create view for city seeding progress
CREATE OR REPLACE VIEW public.city_seeding_progress AS
SELECT 
  c.id,
  c.name,
  c.state,
  c.country,
  c.status,
  c.target_place_count,
  c.target_anchor_count,
  c.launched_at,
  COALESCE(counts.total_places, 0) AS current_place_count,
  COALESCE(counts.approved_places, 0) AS approved_place_count,
  COALESCE(counts.pending_places, 0) AS pending_place_count,
  COALESCE(counts.places_with_vibes, 0) AS curated_place_count,
  CASE 
    WHEN c.target_place_count > 0 
    THEN ROUND((COALESCE(counts.approved_places, 0)::numeric / c.target_place_count) * 100)
    ELSE 0 
  END AS completion_percentage,
  COALESCE(counts.approved_places, 0) >= c.target_place_count AS is_ready_to_launch
FROM public.cities c
LEFT JOIN (
  SELECT 
    city,
    state,
    COUNT(*) AS total_places,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved_places,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_places,
    COUNT(*) FILTER (WHERE vibe_energy IS NOT NULL OR vibe_formality IS NOT NULL) AS places_with_vibes
  FROM public.places
  GROUP BY city, state
) counts ON LOWER(c.name) = LOWER(counts.city) AND 
            (c.state IS NULL AND counts.state IS NULL OR LOWER(c.state) = LOWER(counts.state));

-- Grant access to the view
GRANT SELECT ON public.city_seeding_progress TO authenticated;

-- Add comment
COMMENT ON TABLE public.cities IS 'Tracks city rollout status and seeding targets for controlled directory expansion';
COMMENT ON VIEW public.city_seeding_progress IS 'Aggregates place counts and seeding progress for each city';