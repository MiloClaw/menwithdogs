-- Phase 4: Discovery as Awareness
-- Migration 1: Add discovery opt-in to couples table

-- Add is_discoverable column (default OFF for privacy)
ALTER TABLE couples 
ADD COLUMN is_discoverable boolean NOT NULL DEFAULT false;

-- Add index for efficient discovery queries
CREATE INDEX idx_couples_discoverable 
ON couples(is_discoverable, is_complete, updated_at DESC) 
WHERE is_discoverable = true AND is_complete = true;

-- Migration 2: Create saved_couples table for private bookmarks
CREATE TABLE saved_couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, saved_couple_id)
);

ALTER TABLE saved_couples ENABLE ROW LEVEL SECURITY;

-- Private saves: only the user can see their own bookmarks
CREATE POLICY "Users can read own saves"
ON saved_couples FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
ON saved_couples FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
ON saved_couples FOR DELETE
USING (auth.uid() = user_id);

-- Migration 3: Add RLS policy for discoverable couples
-- Authenticated users can read discoverable, complete couples (excluding their own)
CREATE POLICY "Authenticated users can read discoverable couples"
ON couples FOR SELECT
TO authenticated
USING (
  is_discoverable = true 
  AND is_complete = true
);