-- Add unique constraint on google_place_id to prevent duplicates
-- This is safe as we've confirmed no duplicates exist
CREATE UNIQUE INDEX IF NOT EXISTS places_google_place_id_unique 
  ON public.places (google_place_id);