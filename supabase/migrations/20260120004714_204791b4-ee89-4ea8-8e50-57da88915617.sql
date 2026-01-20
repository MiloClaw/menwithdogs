-- Create a function to get users list for admin with email from auth.users
-- This follows the same pattern as get_founders_redemptions_with_emails
CREATE OR REPLACE FUNCTION public.get_admin_users_list(
  _search text DEFAULT NULL,
  _role_filter text DEFAULT NULL,
  _limit integer DEFAULT 100,
  _offset integer DEFAULT 0
)
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  city text,
  state text,
  is_profile_complete boolean,
  created_at timestamptz,
  couple_id uuid,
  couple_display_name text,
  couple_is_complete boolean,
  subscription_status text,
  roles text[],
  ambassador_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    mp.user_id,
    au.email::text,
    mp.first_name,
    mp.city,
    mp.state,
    mp.is_profile_complete,
    mp.created_at,
    mp.couple_id,
    c.display_name as couple_display_name,
    c.is_complete as couple_is_complete,
    c.subscription_status,
    COALESCE(
      array_agg(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::text[]
    ) as roles,
    aa.status as ambassador_status
  FROM member_profiles mp
  LEFT JOIN auth.users au ON mp.user_id = au.id
  LEFT JOIN couples c ON mp.couple_id = c.id
  LEFT JOIN user_roles ur ON mp.user_id = ur.user_id
  LEFT JOIN ambassador_applications aa ON mp.user_id = aa.user_id
  WHERE 
    -- Search filter
    (_search IS NULL OR _search = '' OR 
      mp.first_name ILIKE '%' || _search || '%' OR
      mp.city ILIKE '%' || _search || '%' OR
      au.email ILIKE '%' || _search || '%' OR
      mp.user_id::text ILIKE '%' || _search || '%'
    )
    -- Role filter
    AND (_role_filter IS NULL OR _role_filter = '' OR EXISTS (
      SELECT 1 FROM user_roles ur2 
      WHERE ur2.user_id = mp.user_id 
      AND ur2.role::text = _role_filter
    ))
  GROUP BY 
    mp.user_id, au.email, mp.first_name, mp.city, mp.state, 
    mp.is_profile_complete, mp.created_at, mp.couple_id,
    c.display_name, c.is_complete, c.subscription_status, aa.status
  ORDER BY mp.created_at DESC
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Grant execute permission to authenticated users (function will check admin role internally)
GRANT EXECUTE ON FUNCTION public.get_admin_users_list TO authenticated;

-- Also create a function to get admin stats including ambassadors and pro users
CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE (
  total_users bigint,
  complete_profiles bigint,
  active_couples bigint,
  pro_subscribers bigint,
  ambassador_count bigint,
  pending_ambassadors bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM member_profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM member_profiles WHERE is_profile_complete = true)::bigint as complete_profiles,
    (SELECT COUNT(*) FROM couples WHERE is_complete = true)::bigint as active_couples,
    (SELECT COUNT(*) FROM couples WHERE subscription_status IN ('pro', 'founders'))::bigint as pro_subscribers,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'ambassador')::bigint as ambassador_count,
    (SELECT COUNT(*) FROM ambassador_applications WHERE status = 'pending')::bigint as pending_ambassadors;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_user_stats TO authenticated;