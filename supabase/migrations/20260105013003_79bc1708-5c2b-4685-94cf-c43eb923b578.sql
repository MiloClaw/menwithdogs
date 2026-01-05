-- Sync primary_category with google_primary_type_display for existing places
-- This fixes mislabeled categories from early data seeding

UPDATE public.places
SET primary_category = google_primary_type_display
WHERE google_primary_type_display IS NOT NULL
  AND primary_category != google_primary_type_display;