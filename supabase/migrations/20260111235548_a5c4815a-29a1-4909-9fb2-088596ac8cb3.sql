-- Phase 1: Extend pro_context_definitions with UI metadata columns
-- Add columns for the 4-step Pro Settings flow

ALTER TABLE pro_context_definitions
ADD COLUMN IF NOT EXISTS step integer CHECK (step BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS section text,
ADD COLUMN IF NOT EXISTS label text,
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS input_type text DEFAULT 'single' CHECK (input_type IN ('single', 'multi')),
ADD COLUMN IF NOT EXISTS show_condition jsonb,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS influence_mode text NOT NULL DEFAULT 'boost' CHECK (influence_mode IN ('overlap', 'boost'));

-- Create index for efficient querying by step/section
CREATE INDEX IF NOT EXISTS idx_pro_context_definitions_step_section 
ON pro_context_definitions(step, section) WHERE is_active = true;

-- Mark existing abstract keys as inactive (they continue working for existing signals)
UPDATE pro_context_definitions SET is_active = false WHERE key IN (
  'home_base_local', 'routine_driven', 'conversation_focused', 
  'low_pressure_social', 'solo_friendly', 'community_oriented',
  'event_oriented', 'spontaneous', 'weekend_focused', 'morning_active',
  'evening_social', 'cozy_intimate', 'energetic_spaces', 'travel_focused',
  'quiet_spaces', 'outdoor_friendly', 'dog_owner', 'sober',
  'faith_adjacent', 'substance_free_spaces', 'arts_culture_oriented',
  'lgbtq_plus', 'gay_men', 'family_friendly'
);