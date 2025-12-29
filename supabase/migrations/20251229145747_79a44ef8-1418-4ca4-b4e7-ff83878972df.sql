-- Create suggested_connections table (canonical interaction artifact)
CREATE TABLE public.suggested_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The two couples involved
  recipient_couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  candidate_couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  
  -- Status with CHECK constraint (not ENUM for flexibility)
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'opted_in', 'mutual', 'dismissed', 'expired')),
  
  -- Consent timestamps (null until action taken)
  recipient_opt_in_at timestamptz,
  candidate_opt_in_at timestamptz,
  
  -- System-generated context (never raw scores to users)
  surfaced_reason text,
  surfaced_rank smallint,
  surfaced_source text DEFAULT 'onboarding'
    CHECK (surfaced_source IN ('onboarding', 'refresh', 'admin', 'experiment')),
  
  -- Lifecycle timestamps
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  resolved_at timestamptz,
  
  -- Prevent duplicate suggestions
  UNIQUE (recipient_couple_id, candidate_couple_id),
  
  -- Prevent self-suggestions
  CHECK (recipient_couple_id != candidate_couple_id)
);

-- Enable RLS
ALTER TABLE public.suggested_connections ENABLE ROW LEVEL SECURITY;

-- Couples can read suggestions where they are recipient OR candidate
CREATE POLICY "Couples can read own suggestions"
ON public.suggested_connections
FOR SELECT
USING (
  recipient_couple_id = get_user_couple_id(auth.uid())
  OR candidate_couple_id = get_user_couple_id(auth.uid())
);

-- Admins can read all suggestions for oversight
CREATE POLICY "Admins can read all suggestions"
ON public.suggested_connections
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Index for efficient lookups by recipient
CREATE INDEX idx_suggested_connections_recipient 
ON public.suggested_connections(recipient_couple_id);

-- Index for efficient lookups by candidate
CREATE INDEX idx_suggested_connections_candidate 
ON public.suggested_connections(candidate_couple_id);

-- Index for status filtering
CREATE INDEX idx_suggested_connections_status 
ON public.suggested_connections(status);

-- Tighten couple_location_summary RLS
DROP POLICY IF EXISTS "Authenticated users can read location summary" 
ON public.couple_location_summary;

-- New policy: only read discoverable couples or own couple
CREATE POLICY "Read discoverable couple locations only"
ON public.couple_location_summary
FOR SELECT
USING (
  couple_id = get_user_couple_id(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.couples
    WHERE couples.id = couple_location_summary.couple_id
    AND couples.is_discoverable = true
    AND couples.is_complete = true
  )
);