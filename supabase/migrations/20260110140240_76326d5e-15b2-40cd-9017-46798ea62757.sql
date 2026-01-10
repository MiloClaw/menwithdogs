-- Add 'metro' to the allowed geo_area types for metro area grouping
ALTER TABLE geo_areas DROP CONSTRAINT IF EXISTS geo_areas_type_check;
ALTER TABLE geo_areas ADD CONSTRAINT geo_areas_type_check 
  CHECK (type = ANY (ARRAY['country', 'admin_area_1', 'admin_area_2', 'locality', 'sublocality', 'neighborhood', 'postal_code', 'metro']));