-- Create atomic function to create couple + member profile
-- This bypasses the INSERT+SELECT RLS timing issue
CREATE OR REPLACE FUNCTION public.create_couple_for_current_user()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _couple_id uuid;
  _existing_couple_id uuid;
BEGIN
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

  -- Create the couple
  INSERT INTO public.couples (status)
  VALUES ('onboarding')
  RETURNING id INTO _couple_id;

  -- Create the member profile linking user to couple
  INSERT INTO public.member_profiles (user_id, couple_id, is_owner, onboarding_step)
  VALUES (_user_id, _couple_id, true, 'profile_pending');

  RETURN _couple_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_couple_for_current_user() TO authenticated;