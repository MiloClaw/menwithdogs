-- Backfill places with 'general' category using their google_primary_type_display
UPDATE places
SET primary_category = google_primary_type_display
WHERE primary_category = 'general'
  AND google_primary_type_display IS NOT NULL
  AND google_primary_type_display != '';