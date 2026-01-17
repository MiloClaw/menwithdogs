-- RPC function for admin to get founders redemptions with user emails
CREATE OR REPLACE FUNCTION get_founders_redemptions_with_emails(
  _city_id uuid DEFAULT NULL,
  _limit integer DEFAULT 100,
  _offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  city_id uuid,
  city_name text,
  city_state text,
  couple_id uuid,
  stripe_subscription_id text,
  stripe_promo_code_id text,
  redeemed_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid;
BEGIN
  -- SECURITY: Only admins can access redemption details
  _caller_id := auth.uid();
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF NOT has_role(_caller_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    fr.id,
    fr.user_id,
    au.email::text as user_email,
    fr.city_id,
    c.name as city_name,
    c.state as city_state,
    fr.couple_id,
    fr.stripe_subscription_id,
    fr.stripe_promo_code_id,
    fr.redeemed_at,
    fr.created_at
  FROM founders_redemptions fr
  LEFT JOIN auth.users au ON au.id = fr.user_id
  LEFT JOIN cities c ON c.id = fr.city_id
  WHERE (_city_id IS NULL OR fr.city_id = _city_id)
  ORDER BY fr.redeemed_at DESC NULLS LAST, fr.created_at DESC
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- RPC function to count total redemptions (for pagination)
CREATE OR REPLACE FUNCTION count_founders_redemptions(_city_id uuid DEFAULT NULL)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM founders_redemptions fr
  WHERE (_city_id IS NULL OR fr.city_id = _city_id)
    AND has_role(auth.uid(), 'admin');
$$;