-- Add 'backfill' and 'auto_approval' to allowed sources for place_geo_areas
ALTER TABLE public.place_geo_areas DROP CONSTRAINT place_geo_areas_source_check;

ALTER TABLE public.place_geo_areas ADD CONSTRAINT place_geo_areas_source_check 
CHECK (source = ANY (ARRAY['google_components', 'polygon', 'nearest', 'admin_override', 'backfill', 'auto_approval']::text[]));