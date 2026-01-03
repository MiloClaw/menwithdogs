-- Add Google Places location data to cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Add comment for documentation
COMMENT ON COLUMN cities.google_place_id IS 'Google Places API place_id for canonical city identification';
COMMENT ON COLUMN cities.lat IS 'City center latitude for location-biased place discovery';
COMMENT ON COLUMN cities.lng IS 'City center longitude for location-biased place discovery';