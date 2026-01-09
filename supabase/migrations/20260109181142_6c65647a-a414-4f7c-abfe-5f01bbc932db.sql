-- DRIFT-LOCK SCHEMA DOCUMENTATION
-- Reference: MATCH APP — CANONICAL INSTRUCTIONS (DRIFT-LOCKED)
-- 
-- These comments document deprecated social-profile artifacts
-- to prevent future drift toward social-network mechanics.

-- =============================================================================
-- TABLE-LEVEL WARNINGS
-- =============================================================================

COMMENT ON TABLE couples IS 
'Relationship unit for place intelligence. NOT a social profile.

DRIFT-LOCK WARNING:
- Do NOT add bio/essay/photo fields for social purposes
- Do NOT add discovery/matching fields
- Do NOT add visibility/popularity fields
- This table exists to scope favorites and preferences to a unit
- Users are training the system, not presenting themselves

Deprecated columns (retained for data migration only):
- about_us: Social profile artifact
- profile_photo_url: Social profile artifact  
- display_name: Internal label only (not for user-to-user display)';

COMMENT ON TABLE member_profiles IS
'Member data for personalization. NOT a social profile.

DRIFT-LOCK WARNING:
- Preferences should map to place types, not identity labels
- Do NOT add social discovery fields
- Do NOT add profile presentation fields
- This table exists to personalize place recommendations

Deprecated columns (do not use):
- social_settings: Social feature artifact
- energy_style: Non-place-centric
- availability: Social scheduling artifact';

-- =============================================================================
-- DEPRECATED COLUMN DOCUMENTATION (couples table)
-- =============================================================================

COMMENT ON COLUMN couples.about_us IS 
'DEPRECATED: Social profile artifact.
- Do NOT use in UI
- Do NOT render to users
- Retained for data migration only
- Violates Rule 2: No bios or "about me/us" fields';

COMMENT ON COLUMN couples.profile_photo_url IS 
'DEPRECATED: Social profile artifact.
- Do NOT render in UI
- Do NOT use for profile discovery
- Violates Rule 2: No profile photos as identity objects';

COMMENT ON COLUMN couples.display_name IS 
'Internal label only.
- NOT for user-to-user display
- Can be used for internal reference only
- Do NOT expose in any discovery or matching context';

-- =============================================================================
-- DEPRECATED COLUMN DOCUMENTATION (member_profiles table)
-- =============================================================================

COMMENT ON COLUMN member_profiles.social_settings IS 
'DEPRECATED: Social feature artifact.
- Do NOT use
- Violates Rule 8: No social-adjacent settings';

COMMENT ON COLUMN member_profiles.energy_style IS 
'DEPRECATED: Non-place-centric.
- Consider migration to signals layer
- Violates Rule 5: All personalization must tie to place types';

COMMENT ON COLUMN member_profiles.availability IS 
'DEPRECATED: Social scheduling artifact.
- Do NOT use
- Violates Rule 8: No social scheduling mechanics';