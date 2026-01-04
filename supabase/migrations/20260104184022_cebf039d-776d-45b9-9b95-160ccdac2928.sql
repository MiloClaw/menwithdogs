-- Create user_preferences table for behavioral preference capture
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  -- Time context: when to prioritize suggestions
  time_preference TEXT CHECK (time_preference IN ('mornings', 'evenings', 'weekends', 'mixed')),
  -- Distance: how far user usually travels
  distance_preference TEXT CHECK (distance_preference IN ('close', 'medium', 'far')),
  -- Vibe: energy level preference
  vibe_preference TEXT CHECK (vibe_preference IN ('quiet', 'balanced', 'lively', 'depends')),
  -- Intent: what user is usually looking for (multi-select stored as JSONB array)
  intent_preferences JSONB DEFAULT '[]'::jsonb,
  -- Geographic affinity
  geo_affinity TEXT CHECK (geo_affinity IN ('single_area', 'few_areas', 'anywhere')),
  -- Prompt state tracking: which prompts shown and when
  prompts_shown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read own preferences
CREATE POLICY "Users can read own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a generic update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the create_couple_for_current_user function to default type to 'individual'
CREATE OR REPLACE FUNCTION public.create_couple_for_current_user(unit_type text DEFAULT 'individual')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _couple_id uuid;
  _existing_couple_id uuid;
  _is_individual boolean;
BEGIN
  -- Validate unit_type
  IF unit_type NOT IN ('couple', 'individual') THEN
    RAISE EXCEPTION 'Invalid unit_type: must be couple or individual';
  END IF;

  -- Get current user
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a member profile
  SELECT couple_id INTO _existing_couple_id
  FROM public.member_profiles
  WHERE user_id = _user_id
  LIMIT 1;

  IF _existing_couple_id IS NOT NULL THEN
    -- Return existing couple_id instead of error (idempotent)
    RETURN _existing_couple_id;
  END IF;

  -- Determine if this is an individual (affects is_complete flag)
  _is_individual := (unit_type = 'individual');

  -- Create the relationship unit
  -- For individuals: is_complete = true (no partner needed)
  -- For couples: is_complete = false (partner must join)
  INSERT INTO public.couples (status, type, is_complete)
  VALUES ('onboarding', unit_type, _is_individual)
  RETURNING id INTO _couple_id;

  -- Create the member profile linking user to relationship unit
  INSERT INTO public.member_profiles (user_id, couple_id, is_owner, onboarding_step)
  VALUES (_user_id, _couple_id, true, 'profile_pending');

  RETURN _couple_id;
END;
$$;