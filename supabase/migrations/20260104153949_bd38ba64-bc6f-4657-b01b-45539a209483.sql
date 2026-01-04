-- Drop RLS policies that depend on is_discoverable first
DROP POLICY IF EXISTS "Authenticated users can read discoverable couples" ON public.couples;
DROP POLICY IF EXISTS "Read discoverable couple locations only" ON public.couple_location_summary;

-- Drop view (depends on couple_reveals)
DROP VIEW IF EXISTS public.revealed_couples_view;

-- Drop couple_reveals table
DROP TABLE IF EXISTS public.couple_reveals;

-- Drop suggested_connections table
DROP TABLE IF EXISTS public.suggested_connections;

-- Drop saved_couples table
DROP TABLE IF EXISTS public.saved_couples;

-- Remove is_discoverable column from couples table
ALTER TABLE public.couples DROP COLUMN IF EXISTS is_discoverable;

-- Create new RLS policy for couple_location_summary without is_discoverable
CREATE POLICY "Read own couple location" 
  ON public.couple_location_summary 
  FOR SELECT 
  USING (couple_id = get_user_couple_id(auth.uid()));