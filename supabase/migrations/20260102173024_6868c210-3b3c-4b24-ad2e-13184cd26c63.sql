-- ================================================
-- Phase 1: Directory Rebuild Schema Migration
-- ================================================

-- 1.1 Drop Legacy Tables (empty/unused)
DROP TABLE IF EXISTS couple_place_likes CASCADE;
DROP TABLE IF EXISTS couple_event_likes CASCADE;
DROP TABLE IF EXISTS couple_place_signals CASCADE;
DROP TABLE IF EXISTS member_place_affinities CASCADE;

-- 1.2 Add Profile Photo Column to couples
ALTER TABLE couples ADD COLUMN IF NOT EXISTS profile_photo_url text DEFAULT NULL;

-- 1.3 Create Presence Status Enum
CREATE TYPE presence_status AS ENUM ('interested', 'planning_to_attend', 'open_to_hello');

-- 1.4 Create couple_presence Table
CREATE TABLE couple_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  status presence_status NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Exactly one of place_id or event_id must be set
  CONSTRAINT presence_context_check CHECK (
    (place_id IS NOT NULL AND event_id IS NULL) OR
    (place_id IS NULL AND event_id IS NOT NULL)
  )
);

-- Create unique partial indexes for one status per couple per context
CREATE UNIQUE INDEX unique_couple_place ON couple_presence(couple_id, place_id) 
  WHERE place_id IS NOT NULL;
CREATE UNIQUE INDEX unique_couple_event ON couple_presence(couple_id, event_id) 
  WHERE event_id IS NOT NULL;

-- Performance indexes
CREATE INDEX idx_presence_place ON couple_presence(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX idx_presence_event ON couple_presence(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_presence_open ON couple_presence(place_id, event_id, status) 
  WHERE status = 'open_to_hello';

-- Enable RLS on couple_presence
ALTER TABLE couple_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for couple_presence
CREATE POLICY "Couples can read own presence"
ON couple_presence FOR SELECT
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can insert own presence"
ON couple_presence FOR INSERT
WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can update own presence"
ON couple_presence FOR UPDATE
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own presence"
ON couple_presence FOR DELETE
USING (couple_id = get_user_couple_id(auth.uid()));

-- Authenticated users can read all presence for aggregate views
CREATE POLICY "Authenticated can read presence for aggregates"
ON couple_presence FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 1.5 Create Reveal Enums
CREATE TYPE reveal_context AS ENUM ('place', 'event');
CREATE TYPE reveal_state AS ENUM ('eligible', 'revealed', 'expired');

-- 1.6 Create couple_reveals Table
CREATE TABLE couple_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type reveal_context NOT NULL,
  place_id uuid REFERENCES places(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  couple_a_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  couple_b_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  state reveal_state NOT NULL DEFAULT 'eligible',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  
  -- Context check
  CONSTRAINT reveal_context_check CHECK (
    (context_type = 'place' AND place_id IS NOT NULL AND event_id IS NULL) OR
    (context_type = 'event' AND event_id IS NOT NULL AND place_id IS NULL)
  ),
  
  -- Normalized order: couple_a_id < couple_b_id
  CONSTRAINT couple_order_check CHECK (couple_a_id < couple_b_id)
);

-- Create unique partial indexes for unique pairings per context
CREATE UNIQUE INDEX unique_reveal_place ON couple_reveals(couple_a_id, couple_b_id, place_id)
  WHERE place_id IS NOT NULL;
CREATE UNIQUE INDEX unique_reveal_event ON couple_reveals(couple_a_id, couple_b_id, event_id)
  WHERE event_id IS NOT NULL;

-- Performance indexes for couple_reveals
CREATE INDEX idx_reveals_couple_a ON couple_reveals(couple_a_id);
CREATE INDEX idx_reveals_couple_b ON couple_reveals(couple_b_id);
CREATE INDEX idx_reveals_state ON couple_reveals(state) WHERE state = 'revealed';

-- Enable RLS on couple_reveals
ALTER TABLE couple_reveals ENABLE ROW LEVEL SECURITY;

-- RLS: Couples can only read rows where they are involved AND state is revealed
CREATE POLICY "Couples can read revealed records"
ON couple_reveals FOR SELECT
USING (
  state = 'revealed' AND
  expires_at > now() AND
  (couple_a_id = get_user_couple_id(auth.uid()) OR couple_b_id = get_user_couple_id(auth.uid()))
);

-- 1.7 Create Reveal Trigger Function
CREATE OR REPLACE FUNCTION process_presence_reveal()
RETURNS TRIGGER AS $$
DECLARE
  other_presence RECORD;
  min_expires timestamptz;
  ordered_a uuid;
  ordered_b uuid;
BEGIN
  -- Only process open_to_hello status
  IF NEW.status != 'open_to_hello' THEN
    RETURN NEW;
  END IF;
  
  -- Find other couples with overlapping open_to_hello in same context
  FOR other_presence IN
    SELECT cp.couple_id, cp.ends_at
    FROM couple_presence cp
    WHERE cp.status = 'open_to_hello'
      AND cp.ends_at > now()
      AND cp.couple_id != NEW.couple_id
      AND (
        (NEW.place_id IS NOT NULL AND cp.place_id = NEW.place_id) OR
        (NEW.event_id IS NOT NULL AND cp.event_id = NEW.event_id)
      )
  LOOP
    -- Calculate minimum expiry (with 15-min grace period)
    min_expires := LEAST(NEW.ends_at, other_presence.ends_at) + interval '15 minutes';
    
    -- Order couple IDs for constraint
    IF NEW.couple_id < other_presence.couple_id THEN
      ordered_a := NEW.couple_id;
      ordered_b := other_presence.couple_id;
    ELSE
      ordered_a := other_presence.couple_id;
      ordered_b := NEW.couple_id;
    END IF;
    
    -- Upsert reveal record for place context
    IF NEW.place_id IS NOT NULL THEN
      INSERT INTO couple_reveals (
        context_type, place_id, event_id, couple_a_id, couple_b_id, state, expires_at
      ) VALUES (
        'place'::reveal_context,
        NEW.place_id,
        NULL,
        ordered_a,
        ordered_b,
        'revealed',
        min_expires
      )
      ON CONFLICT (couple_a_id, couple_b_id, place_id) WHERE place_id IS NOT NULL
      DO UPDATE SET 
        state = 'revealed', 
        expires_at = GREATEST(couple_reveals.expires_at, EXCLUDED.expires_at);
    END IF;
    
    -- Upsert reveal record for event context
    IF NEW.event_id IS NOT NULL THEN
      INSERT INTO couple_reveals (
        context_type, place_id, event_id, couple_a_id, couple_b_id, state, expires_at
      ) VALUES (
        'event'::reveal_context,
        NULL,
        NEW.event_id,
        ordered_a,
        ordered_b,
        'revealed',
        min_expires
      )
      ON CONFLICT (couple_a_id, couple_b_id, event_id) WHERE event_id IS NOT NULL
      DO UPDATE SET 
        state = 'revealed', 
        expires_at = GREATEST(couple_reveals.expires_at, EXCLUDED.expires_at);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER trigger_presence_reveal
  AFTER INSERT OR UPDATE ON couple_presence
  FOR EACH ROW
  EXECUTE FUNCTION process_presence_reveal();

-- 1.8 Create Aggregation Views
CREATE OR REPLACE VIEW place_presence_agg AS
SELECT 
  place_id,
  COUNT(*) FILTER (WHERE status = 'interested') AS interested_count,
  COUNT(*) FILTER (WHERE status = 'planning_to_attend' AND ends_at > now()) AS planning_count,
  COUNT(*) FILTER (WHERE status = 'open_to_hello' AND ends_at > now()) AS open_count
FROM couple_presence
WHERE place_id IS NOT NULL
GROUP BY place_id;

CREATE OR REPLACE VIEW event_presence_agg AS
SELECT 
  event_id,
  COUNT(*) FILTER (WHERE status = 'interested') AS interested_count,
  COUNT(*) FILTER (WHERE status = 'planning_to_attend' AND ends_at > now()) AS planning_count,
  COUNT(*) FILTER (WHERE status = 'open_to_hello' AND ends_at > now()) AS open_count
FROM couple_presence
WHERE event_id IS NOT NULL
GROUP BY event_id;

-- 1.9 Create Revealed Couples View for safe querying
CREATE OR REPLACE VIEW revealed_couples_view AS
SELECT 
  cr.id,
  cr.context_type,
  cr.place_id,
  cr.event_id,
  cr.couple_a_id,
  cr.couple_b_id,
  cr.expires_at,
  ca.display_name AS couple_a_display_name,
  ca.profile_photo_url AS couple_a_photo,
  cb.display_name AS couple_b_display_name,
  cb.profile_photo_url AS couple_b_photo
FROM couple_reveals cr
JOIN couples ca ON cr.couple_a_id = ca.id
JOIN couples cb ON cr.couple_b_id = cb.id
WHERE cr.state = 'revealed'
  AND cr.expires_at > now();