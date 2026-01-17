-- Fix search_path for find_metro_for_county function
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
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;