-- Fix RLS policy conflict for user place submissions
-- The original "Admins can insert places" policy lacked explicit role targeting,
-- causing evaluation conflicts with the authenticated user submission policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can insert places" ON public.places;

-- Recreate with explicit role targeting so both INSERT policies are properly OR'd
CREATE POLICY "Admins can insert places"
  ON public.places
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));