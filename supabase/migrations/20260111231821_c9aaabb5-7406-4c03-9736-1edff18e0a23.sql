-- Create a secure function for admin dashboard stats access
-- Only admins can call this function
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
  total_couples bigint,
  active_couples bigint,
  approved_places bigint,
  pending_places bigint,
  approved_events bigint,
  pending_events bigint,
  total_cities bigint,
  draft_cities bigint,
  launched_cities bigint,
  paused_cities bigint,
  ready_to_launch_cities bigint,
  total_posts bigint,
  total_members bigint,
  total_favorites bigint,
  computed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid;
BEGIN
  -- SECURITY: Only admins can access dashboard stats
  _caller_id := auth.uid();
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF NOT has_role(_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  -- Return data from the materialized view
  RETURN QUERY
  SELECT 
    ads.total_couples,
    ads.active_couples,
    ads.approved_places,
    ads.pending_places,
    ads.approved_events,
    ads.pending_events,
    ads.total_cities,
    ads.draft_cities,
    ads.launched_cities,
    ads.paused_cities,
    ads.ready_to_launch_cities,
    ads.total_posts,
    ads.total_members,
    ads.total_favorites,
    ads.computed_at
  FROM public.admin_dashboard_stats ads
  LIMIT 1;
END;
$$;