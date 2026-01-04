-- ============================================================
-- SPRINT 1: DATABASE FOUNDATION
-- ============================================================

-- 1.1 Enhance places table with new columns
-- ============================================================

-- Add google_types array for raw Google place types
ALTER TABLE places ADD COLUMN IF NOT EXISTS google_types text[] DEFAULT '{}';

-- Add last_fetched_at for tracking freshness
ALTER TABLE places ADD COLUMN IF NOT EXISTS last_fetched_at timestamptz;

-- Add fetch_version for tracking schema version of fetched data
ALTER TABLE places ADD COLUMN IF NOT EXISTS fetch_version int DEFAULT 1;

-- Add business_status from Google (OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY)
ALTER TABLE places ADD COLUMN IF NOT EXISTS business_status text;

-- Add utc_offset_minutes for timezone handling
ALTER TABLE places ADD COLUMN IF NOT EXISTS utc_offset_minutes int;

-- Add is_active boolean (replaces status enum for simpler queries)
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Backfill is_active based on existing status
UPDATE places SET is_active = (status = 'approved') WHERE is_active IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_places_google_types ON places USING GIN (google_types);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON places (is_active);
CREATE INDEX IF NOT EXISTS idx_places_last_fetched ON places (last_fetched_at);

-- 1.2 Create places_google_snapshots table (Audit Trail)
-- ============================================================

CREATE TABLE IF NOT EXISTS places_google_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  raw_response jsonb NOT NULL,
  source text NOT NULL DEFAULT 'google_places',
  created_at timestamptz DEFAULT now()
);

-- Indexes for snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_place_id ON places_google_snapshots (place_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_fetched_at ON places_google_snapshots (fetched_at DESC);

-- Enable RLS on snapshots
ALTER TABLE places_google_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin-only policy for snapshots
CREATE POLICY "Admins can manage snapshots" ON places_google_snapshots
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 1.3 Create admin_place_metadata table (Editorial Layer)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_place_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL UNIQUE REFERENCES places(id) ON DELETE CASCADE,
  internal_tags text[] DEFAULT '{}',
  lgbtq_confidence smallint CHECK (lgbtq_confidence IS NULL OR (lgbtq_confidence >= 0 AND lgbtq_confidence <= 3)),
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for metadata lookups
CREATE INDEX IF NOT EXISTS idx_admin_metadata_place ON admin_place_metadata (place_id);

-- Enable RLS on metadata
ALTER TABLE admin_place_metadata ENABLE ROW LEVEL SECURITY;

-- Admin-only policy for metadata
CREATE POLICY "Admins can manage place metadata" ON admin_place_metadata
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_admin_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_admin_place_metadata_timestamp
  BEFORE UPDATE ON admin_place_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_metadata_updated_at();