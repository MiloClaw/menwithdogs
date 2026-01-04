-- Add relationship unit type column to couples table
-- This future-proofs the schema for individuals while keeping current behavior
ALTER TABLE public.couples 
ADD COLUMN type TEXT NOT NULL DEFAULT 'couple' 
CHECK (type IN ('couple', 'individual'));

-- Add subscription status column for monetization
ALTER TABLE public.couples 
ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free' 
CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled', 'paused'));

-- Update the atomic creation function to support both paths
CREATE OR REPLACE FUNCTION public.create_couple_for_current_user(unit_type TEXT DEFAULT 'couple')
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Add comment to clarify the conceptual rename
COMMENT ON TABLE public.couples IS 'Conceptually represents a relationship_unit (type: couple | individual). Named "couples" for backward compatibility.';