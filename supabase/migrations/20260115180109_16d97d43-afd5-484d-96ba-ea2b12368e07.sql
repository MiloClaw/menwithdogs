-- Meta-preference columns (shape HOW relevance is computed, not WHAT is relevant)
-- These are probabilistic modifiers only — never filters, never absolute.

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS choice_priority JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS uncertainty_tolerance TEXT,
ADD COLUMN IF NOT EXISTS return_preference TEXT,
ADD COLUMN IF NOT EXISTS planning_horizon TEXT,
ADD COLUMN IF NOT EXISTS sensory_sensitivity JSONB DEFAULT '[]'::jsonb;

-- Add CHECK constraints for single-select columns
ALTER TABLE user_preferences 
ADD CONSTRAINT uncertainty_tolerance_check 
CHECK (uncertainty_tolerance IS NULL OR uncertainty_tolerance IN ('prefer_known', 'mix_both', 'enjoy_new'));

ALTER TABLE user_preferences 
ADD CONSTRAINT return_preference_check 
CHECK (return_preference IS NULL OR return_preference IN ('return_often', 'one_off', 'mix_both'));

ALTER TABLE user_preferences 
ADD CONSTRAINT planning_horizon_check 
CHECK (planning_horizon IS NULL OR planning_horizon IN ('on_the_spot', 'same_day', 'few_days', 'routine'));

-- Add comment for documentation
COMMENT ON COLUMN user_preferences.choice_priority IS 'Up to 2 selections: convenience, atmosphere, quality, social_energy, familiarity, novelty';
COMMENT ON COLUMN user_preferences.uncertainty_tolerance IS 'How user feels about trying new places';
COMMENT ON COLUMN user_preferences.return_preference IS 'Preference for return visits vs one-off places';
COMMENT ON COLUMN user_preferences.planning_horizon IS 'How far ahead user typically plans outings';
COMMENT ON COLUMN user_preferences.sensory_sensitivity IS 'Sensory factors that reduce enjoyment - signal collected, interpretation deferred';