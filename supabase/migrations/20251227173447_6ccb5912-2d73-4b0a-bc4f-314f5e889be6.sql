-- Phase 3: Couple Identity Creation - Core Schema
-- Migration 1 of 1: Complete schema setup

-- =============================================================================
-- ENUMS
-- =============================================================================

-- App role enum for authorization (admin vs regular user)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =============================================================================
-- USER ROLES TABLE
-- Stores user authorization roles. Kept separate from profiles for security.
-- =============================================================================

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- Bypasses RLS to prevent recursive policy checks
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================================================
-- COUPLES TABLE
-- Container for a couple relationship. Limited to 2 members.
-- =============================================================================

CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shared profile fields (editable by both partners)
  display_name text,
  about_us text,
  -- FUTURE: interests will migrate to a join table for ML/vector compatibility.
  -- For now, enforced as controlled vocabulary via UI (see src/lib/interests.ts)
  shared_interests text[],
  preferred_meetup_times text,
  
  -- is_complete means ONLY "both members have joined"
  -- Do NOT reuse for: profile completeness, discovery readiness, monetization gates
  is_complete boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MEMBER PROFILES TABLE
-- Individual profile for each partner. Private by default.
-- =============================================================================

CREATE TABLE public.member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  
  -- Authorization: owner can manage couple settings (not social status)
  is_owner boolean NOT NULL DEFAULT false,
  
  -- Required fields (Phase 3 minimum)
  first_name text,
  city text,
  -- FUTURE: interests will migrate to a join table for ML/vector compatibility.
  -- For now, enforced as controlled vocabulary via UI. Exactly 3 required.
  interests text[],
  
  -- Optional fields
  social_settings text,
  availability text,
  energy_style text,
  
  -- Profile completion tracking
  is_profile_complete boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own member profile
CREATE POLICY "Users can read own member profile"
  ON public.member_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own member profile
CREATE POLICY "Users can update own member profile"
  ON public.member_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own member profile
CREATE POLICY "Users can insert own member profile"
  ON public.member_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their partner's profile (same couple)
CREATE POLICY "Users can read partner profile"
  ON public.member_profiles
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- Couple members can read their couple
CREATE POLICY "Couple members can read couple"
  ON public.couples
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- Couple members can update their couple
CREATE POLICY "Couple members can update couple"
  ON public.couples
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert a new couple (when creating)
CREATE POLICY "Authenticated users can create couples"
  ON public.couples
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- COUPLE INVITES TABLE
-- Single-use invite tokens for partner invitation. Tokens hashed at rest.
-- =============================================================================

CREATE TABLE public.couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_email text NOT NULL,
  
  -- Security: token is hashed (SHA-256), never stored plaintext
  token_hash text NOT NULL,
  
  -- Expiry and usage tracking
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;

-- Invite creator can read their invites
CREATE POLICY "Invite creator can read invites"
  ON public.couple_invites
  FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid());

-- Invite creator can insert invites
CREATE POLICY "Invite creator can insert invites"
  ON public.couple_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

-- Invite creator can update invites (for marking accepted)
CREATE POLICY "Invite creator can update invites"
  ON public.couple_invites
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid());

-- =============================================================================
-- COUPLE PROFILE DRAFTS TABLE
-- AI-generated draft profiles. Non-destructive, regenerable.
-- =============================================================================

CREATE TABLE public.couple_profile_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- AI-generated suggestions
  generated_display_name text,
  generated_about_us text,
  generated_shared_interests text[],
  
  -- Whether draft has been applied to live profile
  is_applied boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couple_profile_drafts ENABLE ROW LEVEL SECURITY;

-- Couple members can read their draft
CREATE POLICY "Couple members can read draft"
  ON public.couple_profile_drafts
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- Couple members can insert draft
CREATE POLICY "Couple members can insert draft"
  ON public.couple_profile_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- Couple members can update draft
CREATE POLICY "Couple members can update draft"
  ON public.couple_profile_drafts
  FOR UPDATE
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM public.member_profiles WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Auto-update updated_at on couples
CREATE OR REPLACE FUNCTION public.update_couples_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_couples_updated_at();

-- Auto-update updated_at on member_profiles
CREATE TRIGGER update_member_profiles_updated_at
  BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_couples_updated_at();

-- Auto-update updated_at on couple_profile_drafts
CREATE TRIGGER update_couple_profile_drafts_updated_at
  BEFORE UPDATE ON public.couple_profile_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_couples_updated_at();