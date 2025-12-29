-- Add GBP data columns to places table
ALTER TABLE places
ADD COLUMN IF NOT EXISTS rating numeric(2,1),
ADD COLUMN IF NOT EXISTS user_ratings_total integer,
ADD COLUMN IF NOT EXISTS price_level integer,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS google_maps_url text,
ADD COLUMN IF NOT EXISTS formatted_address text,
ADD COLUMN IF NOT EXISTS opening_hours jsonb,
ADD COLUMN IF NOT EXISTS photos jsonb,
ADD COLUMN IF NOT EXISTS google_primary_type text,
ADD COLUMN IF NOT EXISTS google_primary_type_display text;