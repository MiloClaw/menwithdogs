-- PHASE 0: Hardening - Add deprecation comments to social-profile artifacts
-- These columns exist for backward compatibility but should NOT be used in new code

-- Couples table deprecated columns
COMMENT ON COLUMN couples.display_name IS 'DEPRECATED: Social profile artifact. Do not use in new code. Use relationship_unit for preference aggregation only.';
COMMENT ON COLUMN couples.about_us IS 'DEPRECATED: Bio field violates Rule 2 (no social profiles). Do not use.';
COMMENT ON COLUMN couples.profile_photo_url IS 'DEPRECATED: Profile photo violates Rule 2 (no social profiles). Do not use.';
COMMENT ON COLUMN couples.preferred_meetup_times IS 'DEPRECATED: Social coordination field. Do not use.';
COMMENT ON COLUMN couples.partner_first_name IS 'DEPRECATED: Use member_profiles.first_name instead. Kept for legacy compatibility.';

-- Member profiles deprecated columns
COMMENT ON COLUMN member_profiles.social_settings IS 'DEPRECATED: Social visibility controls violate Rule 2. Do not use.';
COMMENT ON COLUMN member_profiles.availability IS 'DEPRECATED: Social coordination field. Do not use.';
COMMENT ON COLUMN member_profiles.energy_style IS 'DEPRECATED: Personality/identity field violates Rule 2. Do not use.';

-- Add architectural documentation to the couples table
COMMENT ON TABLE couples IS 'ARCHITECTURAL NOTE: Despite legacy naming, this table represents a "Preference Group" (aggregation unit for recommendations). type=individual is the default for single users. type=couple enables shared preferences. This is NOT a social profile - users train the system, not present themselves to others. The directory is the spine.';