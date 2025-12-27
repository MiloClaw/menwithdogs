-- Create helper function to get user's couple_id (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_couple_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_id
  FROM public.member_profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Fix member_profiles policies
DROP POLICY IF EXISTS "Users can read partner profile" ON public.member_profiles;
CREATE POLICY "Users can read partner profile"
ON public.member_profiles
FOR SELECT
TO authenticated
USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Fix couples policies
DROP POLICY IF EXISTS "Couple members can read couple" ON public.couples;
DROP POLICY IF EXISTS "Couple members can update couple" ON public.couples;

CREATE POLICY "Couple members can read couple"
ON public.couples
FOR SELECT
TO authenticated
USING (id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can update couple"
ON public.couples
FOR UPDATE
TO authenticated
USING (id = public.get_user_couple_id(auth.uid()));

-- Fix couple_profile_drafts policies
DROP POLICY IF EXISTS "Couple members can read draft" ON public.couple_profile_drafts;
DROP POLICY IF EXISTS "Couple members can insert draft" ON public.couple_profile_drafts;
DROP POLICY IF EXISTS "Couple members can update draft" ON public.couple_profile_drafts;

CREATE POLICY "Couple members can read draft"
ON public.couple_profile_drafts
FOR SELECT
TO authenticated
USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can insert draft"
ON public.couple_profile_drafts
FOR INSERT
TO authenticated
WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can update draft"
ON public.couple_profile_drafts
FOR UPDATE
TO authenticated
USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Fix couple_location_summary policies
DROP POLICY IF EXISTS "Couple members can insert own summary" ON public.couple_location_summary;
DROP POLICY IF EXISTS "Couple members can update own summary" ON public.couple_location_summary;

CREATE POLICY "Couple members can insert own summary"
ON public.couple_location_summary
FOR INSERT
TO authenticated
WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can update own summary"
ON public.couple_location_summary
FOR UPDATE
TO authenticated
USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Fix couple_place_signals policies
DROP POLICY IF EXISTS "Couple members can read signals" ON public.couple_place_signals;

CREATE POLICY "Couple members can read signals"
ON public.couple_place_signals
FOR SELECT
TO authenticated
USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Fix couple_invites policies
DROP POLICY IF EXISTS "Invite creator can read invites" ON public.couple_invites;
DROP POLICY IF EXISTS "Invite creator can insert invites" ON public.couple_invites;
DROP POLICY IF EXISTS "Invite creator can update invites" ON public.couple_invites;

CREATE POLICY "Invite creator can read invites"
ON public.couple_invites
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

CREATE POLICY "Invite creator can insert invites"
ON public.couple_invites
FOR INSERT
TO authenticated
WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Invite creator can update invites"
ON public.couple_invites
FOR UPDATE
TO authenticated
USING (invited_by = auth.uid());