-- Add editorial vibe tag columns to places table
ALTER TABLE places
ADD COLUMN vibe_energy smallint CHECK (vibe_energy >= 1 AND vibe_energy <= 5),
ADD COLUMN vibe_formality smallint CHECK (vibe_formality >= 1 AND vibe_formality <= 5),
ADD COLUMN vibe_conversation boolean,
ADD COLUMN vibe_daytime boolean,
ADD COLUMN vibe_evening boolean;

COMMENT ON COLUMN places.vibe_energy IS 'Energy level 1-5: 1=quiet/observational, 5=high energy/interactive';
COMMENT ON COLUMN places.vibe_formality IS 'Formality level 1-5: 1=very casual, 5=upscale/elevated';
COMMENT ON COLUMN places.vibe_conversation IS 'True if space is conducive to conversation';
COMMENT ON COLUMN places.vibe_daytime IS 'True if suitable for daytime visits';
COMMENT ON COLUMN places.vibe_evening IS 'True if suitable for evening visits';