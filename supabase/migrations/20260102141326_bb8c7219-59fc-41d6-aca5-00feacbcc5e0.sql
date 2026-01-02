-- Phase A: Add partner_first_name to couples table
ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS partner_first_name text DEFAULT NULL;

-- Phase C: Add confirmation columns to couples table
ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confirmation_text text DEFAULT 'We are joining as a couple for platonic friendship only.';

-- Backfill existing complete couples as confirmed
UPDATE public.couples
SET confirmed_at = created_at
WHERE is_complete = true AND confirmed_at IS NULL;

-- Create atomic confirmation function
CREATE OR REPLACE FUNCTION public.confirm_couple_intent(p_couple_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _member_count int;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is a member of this couple
  IF NOT EXISTS (
    SELECT 1 FROM member_profiles 
    WHERE couple_id = p_couple_id AND user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Not a member of this couple';
  END IF;

  -- Verify both members have completed profiles
  SELECT COUNT(*) INTO _member_count
  FROM member_profiles
  WHERE couple_id = p_couple_id AND is_profile_complete = true;

  IF _member_count < 2 THEN
    RAISE EXCEPTION 'Both partners must complete their profiles first';
  END IF;

  -- Set confirmation timestamp
  UPDATE couples
  SET confirmed_at = now()
  WHERE id = p_couple_id AND confirmed_at IS NULL;

  RETURN true;
END;
$$;