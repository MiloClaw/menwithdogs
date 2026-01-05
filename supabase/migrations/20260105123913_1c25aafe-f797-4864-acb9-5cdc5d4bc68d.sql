-- Drop the old overloaded function (no parameters) to resolve PostgREST ambiguity
DROP FUNCTION IF EXISTS public.create_couple_for_current_user();