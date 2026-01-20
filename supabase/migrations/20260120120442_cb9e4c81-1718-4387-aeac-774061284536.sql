-- Add location columns to overlap_sessions table
ALTER TABLE public.overlap_sessions
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision,
ADD COLUMN IF NOT EXISTS location_set_by uuid;

-- Update get_active_overlap_session to return location data
CREATE OR REPLACE FUNCTION public.get_active_overlap_session()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _session record;
  _partner_id uuid;
  _partner_name text;
  _is_initiator boolean;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Find active session for this user
  SELECT * INTO _session
  FROM overlap_sessions
  WHERE (initiator_id = _user_id OR partner_id = _user_id)
    AND status = 'active'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF _session IS NULL THEN
    RETURN NULL;
  END IF;
  
  _is_initiator := _session.initiator_id = _user_id;
  _partner_id := CASE WHEN _is_initiator THEN _session.partner_id ELSE _session.initiator_id END;
  
  -- Get partner's first name
  SELECT first_name INTO _partner_name
  FROM member_profiles
  WHERE user_id = _partner_id AND is_owner = true
  LIMIT 1;
  
  RETURN jsonb_build_object(
    'session_id', _session.id,
    'partner_name', COALESCE(_partner_name, 'Your partner'),
    'is_initiator', _is_initiator,
    'expires_at', _session.expires_at,
    'token', _session.token,
    'location_city', _session.location_city,
    'location_state', _session.location_state,
    'location_lat', _session.location_lat,
    'location_lng', _session.location_lng
  );
END;
$function$;

-- Create function to update session location
CREATE OR REPLACE FUNCTION public.update_overlap_session_location(
  _session_id uuid,
  _city text,
  _state text,
  _lat double precision,
  _lng double precision
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Update location only if user is a participant
  UPDATE overlap_sessions
  SET 
    location_city = _city,
    location_state = _state,
    location_lat = _lat,
    location_lng = _lng,
    location_set_by = _user_id
  WHERE id = _session_id
    AND (initiator_id = _user_id OR partner_id = _user_id)
    AND status = 'active'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or not authorized';
  END IF;
END;
$function$;