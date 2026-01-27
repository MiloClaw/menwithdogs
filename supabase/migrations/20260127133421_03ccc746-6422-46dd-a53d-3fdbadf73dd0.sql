-- Add Google Places amenity/accessibility columns to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS allows_dogs boolean;
ALTER TABLE places ADD COLUMN IF NOT EXISTS wheelchair_accessible_entrance boolean;
ALTER TABLE places ADD COLUMN IF NOT EXISTS wheelchair_accessible_restroom boolean;
ALTER TABLE places ADD COLUMN IF NOT EXISTS wheelchair_accessible_seating boolean;
ALTER TABLE places ADD COLUMN IF NOT EXISTS outdoor_seating boolean;
ALTER TABLE places ADD COLUMN IF NOT EXISTS has_restroom boolean;

-- Add place_id to tag_suggestions to link suggestions to specific places
ALTER TABLE tag_suggestions ADD COLUMN IF NOT EXISTS place_id uuid REFERENCES places(id);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_tag_suggestions_place_id ON tag_suggestions(place_id);