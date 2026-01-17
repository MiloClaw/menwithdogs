
-- ═══════════════════════════════════════════════════════════════
-- PRO SIGNAL FIX: Phase 1 & 2 Combined
-- Migrate place_context_priors keys + Add legacy_key safety net
-- ═══════════════════════════════════════════════════════════════

-- Phase 2a: Add legacy_key column for future drift protection
ALTER TABLE pro_context_definitions 
ADD COLUMN IF NOT EXISTS legacy_key TEXT NULL;

COMMENT ON COLUMN pro_context_definitions.legacy_key IS 
'Optional fallback key for backward compatibility with older priors/density data';

-- Phase 1: Migrate place_context_priors to canonical keys
-- Mapping: legacy_key → canonical_key (from pro_context_definitions)

UPDATE place_context_priors 
SET context_key = 'center_gay_men' 
WHERE context_key = 'gay_men';

UPDATE place_context_priors 
SET context_key = 'morning_leaning' 
WHERE context_key = 'morning_active';

UPDATE place_context_priors 
SET context_key = 'quiet_spaces_v2' 
WHERE context_key = 'quiet_spaces';

UPDATE place_context_priors 
SET context_key = 'outdoor_friendly_v2' 
WHERE context_key = 'outdoor_friendly';

UPDATE place_context_priors 
SET context_key = 'family_friendly_v2' 
WHERE context_key = 'family_friendly';

UPDATE place_context_priors 
SET context_key = 'routine_driven_v2' 
WHERE context_key = 'routine_driven';

UPDATE place_context_priors 
SET context_key = 'event_driven_v2' 
WHERE context_key = 'event_oriented';

UPDATE place_context_priors 
SET context_key = 'calm_conversational' 
WHERE context_key = 'conversation_focused';

UPDATE place_context_priors 
SET context_key = 'ongoing_community' 
WHERE context_key = 'community_oriented';

-- Remove orphaned priors with no canonical match in boost-mode definitions
-- arts_culture_oriented and solo_friendly exist as overlap-mode (identity) only
DELETE FROM place_context_priors 
WHERE context_key IN ('arts_culture_oriented', 'solo_friendly');

-- Phase 2b: Populate legacy_key for any keys that were migrated
-- This ensures backward compatibility if old signals still reference legacy keys
UPDATE pro_context_definitions SET legacy_key = 'gay_men' WHERE key = 'center_gay_men';
UPDATE pro_context_definitions SET legacy_key = 'morning_active' WHERE key = 'morning_leaning';
UPDATE pro_context_definitions SET legacy_key = 'quiet_spaces' WHERE key = 'quiet_spaces_v2';
UPDATE pro_context_definitions SET legacy_key = 'outdoor_friendly' WHERE key = 'outdoor_friendly_v2';
UPDATE pro_context_definitions SET legacy_key = 'family_friendly' WHERE key = 'family_friendly_v2';
UPDATE pro_context_definitions SET legacy_key = 'routine_driven' WHERE key = 'routine_driven_v2';
UPDATE pro_context_definitions SET legacy_key = 'event_oriented' WHERE key = 'event_driven_v2';
UPDATE pro_context_definitions SET legacy_key = 'conversation_focused' WHERE key = 'calm_conversational';
UPDATE pro_context_definitions SET legacy_key = 'community_oriented' WHERE key = 'ongoing_community';
