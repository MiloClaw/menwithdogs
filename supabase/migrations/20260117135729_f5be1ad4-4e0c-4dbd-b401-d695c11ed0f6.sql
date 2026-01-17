-- ============================================================
-- Metro Counties: Maps US counties to launched metro areas
-- Enables intelligent city-suggestion routing to existing metros
-- ============================================================

-- Create metro_counties junction table
CREATE TABLE IF NOT EXISTS public.metro_counties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metro_id uuid NOT NULL REFERENCES public.geo_areas(id) ON DELETE CASCADE,
  county_name text NOT NULL,
  state_code text NOT NULL,
  country_code text NOT NULL DEFAULT 'US',
  created_at timestamptz DEFAULT now(),
  UNIQUE(county_name, state_code, country_code)
);

-- Enable RLS
ALTER TABLE public.metro_counties ENABLE ROW LEVEL SECURITY;

-- Read-only for all authenticated users
CREATE POLICY "Anyone can read metro counties"
  ON public.metro_counties FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage metro counties"
  ON public.metro_counties FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast county lookups
CREATE INDEX IF NOT EXISTS idx_metro_counties_county_state 
  ON public.metro_counties(county_name, state_code);

-- ============================================================
-- Seed Dallas-Fort Worth metro counties
-- ============================================================

INSERT INTO public.metro_counties (metro_id, county_name, state_code) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dallas County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Collin County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Tarrant County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Denton County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Rockwall County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Kaufman County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ellis County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Johnson County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Parker County', 'TX'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Wise County', 'TX')
ON CONFLICT (county_name, state_code, country_code) DO NOTHING;

-- ============================================================
-- Function: find_metro_for_county
-- Looks up if a county belongs to a launched metro area
-- ============================================================

CREATE OR REPLACE FUNCTION public.find_metro_for_county(
  _county_name text,
  _state_code text,
  _country_code text DEFAULT 'US'
) RETURNS TABLE(
  metro_id uuid, 
  metro_name text, 
  primary_city_name text,
  primary_city_state text,
  metro_lat numeric,
  metro_lng numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ga.id AS metro_id,
    ga.name AS metro_name,
    c.name AS primary_city_name,
    c.state AS primary_city_state,
    COALESCE(ga.centroid_lat, c.lat) AS metro_lat,
    COALESCE(ga.centroid_lng, c.lng) AS metro_lng
  FROM public.metro_counties mc
  JOIN public.geo_areas ga ON ga.id = mc.metro_id AND ga.type = 'metro' AND ga.is_active = true
  LEFT JOIN public.cities c ON c.state = mc.state_code AND c.status = 'launched'
  WHERE (
    mc.county_name ILIKE _county_name || '%'
    OR mc.county_name ILIKE '%' || replace(_county_name, ' County', '') || '%'
  )
    AND mc.state_code = _state_code
    AND mc.country_code = _country_code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.find_metro_for_county(text, text, text) TO authenticated;