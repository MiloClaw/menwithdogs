-- Add national_park_id column to places table
ALTER TABLE public.places
ADD COLUMN national_park_id text;

COMMENT ON COLUMN public.places.national_park_id IS
  'Optional link to a National Park ID from the static parks data (e.g., "yosemite"). Used to show "Explore Trails" button in Place modal.';