-- Add event taxonomy columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_format TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS social_energy_level SMALLINT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS commitment_level SMALLINT DEFAULT 2;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cost_type TEXT DEFAULT 'unknown';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Creator tracking
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by_role TEXT DEFAULT 'admin';

-- AI inference metadata (internal only)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS inference_confidence NUMERIC(3,2);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS normalized_by_ai BOOLEAN DEFAULT false;

-- Add CHECK constraints for taxonomy fields
ALTER TABLE public.events ADD CONSTRAINT chk_event_type 
  CHECK (event_type IS NULL OR event_type IN (
    'social', 'cultural', 'food_drink', 'fitness', 
    'entertainment', 'community', 'educational', 
    'outdoor', 'seasonal', 'special_interest'
  ));

ALTER TABLE public.events ADD CONSTRAINT chk_event_format 
  CHECK (event_format IS NULL OR event_format IN (
    'drop_in', 'ticketed', 'reservation_required', 
    'scheduled_program', 'recurring', 'pop_up', 'series', 'all_day'
  ));

ALTER TABLE public.events ADD CONSTRAINT chk_social_energy 
  CHECK (social_energy_level IS NULL OR (social_energy_level >= 1 AND social_energy_level <= 5));

ALTER TABLE public.events ADD CONSTRAINT chk_commitment 
  CHECK (commitment_level IS NULL OR (commitment_level >= 1 AND commitment_level <= 5));

ALTER TABLE public.events ADD CONSTRAINT chk_cost_type 
  CHECK (cost_type IN ('free', 'paid', 'optional_spend', 'unknown'));

ALTER TABLE public.events ADD CONSTRAINT chk_created_by_role 
  CHECK (created_by_role IN ('admin', 'partner', 'user', 'system'));