-- ============================================
-- DISCOVER TOGETHER: OVERLAP SESSIONS
-- Ephemeral session linking for combined place recommendations
-- ============================================

-- Create overlap_sessions table for temporary session linking
CREATE TABLE public.overlap_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  partner_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_overlap_sessions_token ON public.overlap_sessions(token) WHERE status = 'pending';
CREATE INDEX idx_overlap_sessions_initiator ON public.overlap_sessions(initiator_id);
CREATE INDEX idx_overlap_sessions_partner ON public.overlap_sessions(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX idx_overlap_sessions_status ON public.overlap_sessions(status);
CREATE INDEX idx_overlap_sessions_expires ON public.overlap_sessions(expires_at) WHERE status != 'expired';

-- Enable RLS
ALTER TABLE public.overlap_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own sessions (as initiator or partner)
CREATE POLICY "Users can view own sessions" ON public.overlap_sessions
  FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create sessions" ON public.overlap_sessions
  FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can update own sessions" ON public.overlap_sessions
  FOR UPDATE USING (auth.uid() = initiator_id OR auth.uid() = partner_id);

-- ============================================
-- RPC: Create Overlap Session
-- ============================================
CREATE OR REPLACE FUNCTION public.create_overlap_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _token text;
  _session_id uuid;
  _expires_at timestamptz;
  _pending_count int;
  _attempts int := 0;
  _max_attempts int := 10;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Rate limit: max 5 pending sessions per user
  SELECT COUNT(*) INTO _pending_count
  FROM overlap_sessions
  WHERE initiator_id = _user_id AND status = 'pending';
  
  IF _pending_count >= 5 THEN
    RAISE EXCEPTION 'Too many pending sessions. Please cancel existing sessions first.';
  END IF;
  
  -- Generate unique 6-character alphanumeric token
  LOOP
    _token := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if token is unique
    IF NOT EXISTS (SELECT 1 FROM overlap_sessions WHERE token = _token AND status = 'pending') THEN
      EXIT;
    END IF;
    
    _attempts := _attempts + 1;
    IF _attempts >= _max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique token';
    END IF;
  END LOOP;
  
  _expires_at := now() + interval '24 hours';
  
  INSERT INTO overlap_sessions (initiator_id, token, expires_at)
  VALUES (_user_id, _token, _expires_at)
  RETURNING id INTO _session_id;
  
  RETURN jsonb_build_object(
    'session_id', _session_id,
    'token', _token,
    'expires_at', _expires_at
  );
END;
$$;

-- ============================================
-- RPC: Join Overlap Session
-- ============================================
CREATE OR REPLACE FUNCTION public.join_overlap_session(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _session record;
  _initiator_name text;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Find the pending session
  SELECT * INTO _session
  FROM overlap_sessions
  WHERE token = upper(_token)
    AND status = 'pending'
    AND expires_at > now();
  
  IF _session IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired session code';
  END IF;
  
  -- Prevent self-join
  IF _session.initiator_id = _user_id THEN
    RAISE EXCEPTION 'Cannot join your own session';
  END IF;
  
  -- Get initiator's first name for display
  SELECT first_name INTO _initiator_name
  FROM member_profiles
  WHERE user_id = _session.initiator_id AND is_owner = true
  LIMIT 1;
  
  -- Activate the session
  UPDATE overlap_sessions
  SET partner_id = _user_id,
      status = 'active'
  WHERE id = _session.id;
  
  RETURN jsonb_build_object(
    'session_id', _session.id,
    'initiator_name', COALESCE(_initiator_name, 'Your partner'),
    'expires_at', _session.expires_at
  );
END;
$$;

-- ============================================
-- RPC: Get Active Session
-- ============================================
CREATE OR REPLACE FUNCTION public.get_active_overlap_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    'token', _session.token
  );
END;
$$;

-- ============================================
-- RPC: Compute Overlap Affinity
-- ============================================
CREATE OR REPLACE FUNCTION public.compute_overlap_affinity(_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _session record;
  _result jsonb;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get and validate session
  SELECT * INTO _session
  FROM overlap_sessions
  WHERE id = _session_id
    AND status = 'active'
    AND expires_at > now();
  
  IF _session IS NULL THEN
    RAISE EXCEPTION 'Session not found or expired';
  END IF;
  
  -- Validate user is part of session
  IF _user_id != _session.initiator_id AND _user_id != _session.partner_id THEN
    RAISE EXCEPTION 'Not authorized for this session';
  END IF;
  
  -- Compute overlap affinity using LEAST for conservative overlap
  SELECT jsonb_agg(
    jsonb_build_object(
      'place_category', place_category,
      'overlap_score', overlap_score
    )
    ORDER BY overlap_score DESC
  ) INTO _result
  FROM (
    SELECT 
      a.place_category,
      LEAST(a.affinity_score, b.affinity_score) as overlap_score
    FROM user_place_affinity a
    JOIN user_place_affinity b 
      ON a.place_category = b.place_category
    WHERE a.user_id = _session.initiator_id
      AND b.user_id = _session.partner_id
      AND a.affinity_score > 0.1
      AND b.affinity_score > 0.1
  ) overlap;
  
  RETURN COALESCE(_result, '[]'::jsonb);
END;
$$;

-- ============================================
-- RPC: End Overlap Session
-- ============================================
CREATE OR REPLACE FUNCTION public.end_overlap_session(_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Update session status to expired (either participant can end)
  UPDATE overlap_sessions
  SET status = 'expired'
  WHERE id = _session_id
    AND (initiator_id = _user_id OR partner_id = _user_id)
    AND status IN ('pending', 'active');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or already ended';
  END IF;
END;
$$;

-- ============================================
-- RPC: Get Pending Session (for polling)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_pending_overlap_session(_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _session record;
  _partner_name text;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT * INTO _session
  FROM overlap_sessions
  WHERE id = _session_id
    AND initiator_id = _user_id;
  
  IF _session IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Check if expired
  IF _session.expires_at < now() THEN
    UPDATE overlap_sessions SET status = 'expired' WHERE id = _session_id;
    RETURN jsonb_build_object('status', 'expired');
  END IF;
  
  -- If now active, get partner name
  IF _session.status = 'active' AND _session.partner_id IS NOT NULL THEN
    SELECT first_name INTO _partner_name
    FROM member_profiles
    WHERE user_id = _session.partner_id AND is_owner = true
    LIMIT 1;
    
    RETURN jsonb_build_object(
      'status', 'active',
      'partner_name', COALESCE(_partner_name, 'Your partner'),
      'session_id', _session.id
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', _session.status,
    'token', _session.token,
    'expires_at', _session.expires_at
  );
END;
$$;

-- ============================================
-- Scheduled cleanup trigger for expired sessions
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_overlap_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE overlap_sessions 
  SET status = 'expired' 
  WHERE expires_at < now() 
    AND status IN ('pending', 'active');
    
  -- Delete sessions older than 30 days
  DELETE FROM overlap_sessions
  WHERE created_at < now() - interval '30 days';
END;
$$;