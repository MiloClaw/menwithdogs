-- Phase 1: Add couple_status and member_onboarding_step ENUMs and columns

-- 1.1 Create couple_status ENUM
CREATE TYPE public.couple_status AS ENUM (
  'onboarding',      -- Couple created, profile incomplete
  'pending_match',   -- Ready, waiting for introductions
  'active',          -- Receiving intros
  'paused'           -- User-initiated pause
);

-- 1.2 Add status column to couples table
ALTER TABLE public.couples 
ADD COLUMN status couple_status NOT NULL DEFAULT 'onboarding';

-- 1.3 Create member_onboarding_step ENUM (simplified per refinement)
CREATE TYPE public.member_onboarding_step AS ENUM (
  'profile_pending',  -- Default after creation
  'profile_complete'  -- Filled in name, city, interests
);

-- 1.4 Add onboarding_step column to member_profiles table
ALTER TABLE public.member_profiles 
ADD COLUMN onboarding_step member_onboarding_step NOT NULL DEFAULT 'profile_pending';

-- 1.5 Backfill existing data: set profile_complete for members with is_profile_complete = true
UPDATE public.member_profiles 
SET onboarding_step = 'profile_complete' 
WHERE is_profile_complete = true;

-- 1.6 Backfill existing couples: set pending_match for complete+discoverable couples
UPDATE public.couples 
SET status = 'pending_match' 
WHERE is_complete = true;