-- Drop trigger first (it references couple_presence)
DROP TRIGGER IF EXISTS trigger_presence_reveal ON couple_presence;

-- Drop function that processes reveals
DROP FUNCTION IF EXISTS process_presence_reveal();

-- Drop function for intent confirmation (page removed)
DROP FUNCTION IF EXISTS confirm_couple_intent(uuid);

-- Drop views (these are derived from couple_presence)
DROP VIEW IF EXISTS place_presence_agg;
DROP VIEW IF EXISTS event_presence_agg;

-- Drop social layer tables
DROP TABLE IF EXISTS couple_presence CASCADE;
DROP TABLE IF EXISTS couple_profile_drafts CASCADE;
DROP TABLE IF EXISTS couple_location_summary CASCADE;
DROP TABLE IF EXISTS couple_invites CASCADE;

-- Remove confirmed_at column from couples (no longer used)
ALTER TABLE couples DROP COLUMN IF EXISTS confirmed_at;
ALTER TABLE couples DROP COLUMN IF EXISTS confirmation_text;