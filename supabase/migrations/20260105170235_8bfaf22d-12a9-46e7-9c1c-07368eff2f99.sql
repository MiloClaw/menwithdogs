-- Phase 0: Add stored photo URLs column to places table
-- This enables permanent photo storage instead of per-request API proxying

ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS stored_photo_urls text[] DEFAULT NULL;

ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS photos_stored_at timestamptz DEFAULT NULL;

-- Add index for efficient querying of places with/without stored photos
CREATE INDEX IF NOT EXISTS idx_places_photos_stored_at ON public.places (photos_stored_at) 
WHERE photos_stored_at IS NULL;