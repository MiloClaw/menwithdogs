-- Fix posts table: Create a secure view that hides created_by for non-admins
-- Since views inherit RLS from underlying tables, we'll use explicit column selection approach

-- First, let's create a database function to safely get post data
CREATE OR REPLACE FUNCTION public.get_public_posts(
  _city_id uuid DEFAULT NULL,
  _limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  body text,
  type text,
  status text,
  city_id uuid,
  place_id uuid,
  cover_image_url text,
  external_url text,
  start_date timestamptz,
  end_date timestamptz,
  is_recurring boolean,
  recurrence_text text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.title,
    p.body,
    p.type,
    p.status,
    p.city_id,
    p.place_id,
    p.cover_image_url,
    p.external_url,
    p.start_date,
    p.end_date,
    p.is_recurring,
    p.recurrence_text,
    p.created_at,
    p.updated_at
  FROM posts p
  WHERE p.status = 'published'
    AND (_city_id IS NULL OR p.city_id = _city_id)
  ORDER BY p.created_at DESC
  LIMIT _limit;
$$;

-- Create a function to safely get event data without exposing submitter/approver IDs
CREATE OR REPLACE FUNCTION public.get_public_events(
  _venue_place_id uuid DEFAULT NULL,
  _status text DEFAULT 'approved',
  _limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  venue_place_id uuid,
  start_at timestamptz,
  end_at timestamptz,
  status event_status,
  source place_source,
  event_type text,
  event_format text,
  cost_type text,
  category_tags text[],
  is_recurring boolean,
  commitment_level smallint,
  social_energy_level smallint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.name,
    e.description,
    e.venue_place_id,
    e.start_at,
    e.end_at,
    e.status,
    e.source,
    e.event_type,
    e.event_format,
    e.cost_type,
    e.category_tags,
    e.is_recurring,
    e.commitment_level,
    e.social_energy_level,
    e.created_at,
    e.updated_at
  FROM events e
  WHERE e.status = _status::event_status
    AND (_venue_place_id IS NULL OR e.venue_place_id = _venue_place_id)
  ORDER BY e.start_at ASC
  LIMIT _limit;
$$;

-- Add comment explaining the security purpose
COMMENT ON FUNCTION public.get_public_posts IS 'Returns published posts without exposing creator IDs. Use for public-facing queries.';
COMMENT ON FUNCTION public.get_public_events IS 'Returns approved events without exposing submitter/approver IDs. Use for public-facing queries.';