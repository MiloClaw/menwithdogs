-- Phase 1: Trail Blazer Content Submission System Schema

-- 1.1 Create Contribution Types Definitions Table
CREATE TABLE trail_blazer_context_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed initial context types
INSERT INTO trail_blazer_context_types (key, label, description, sort_order) VALUES
  ('seasonal', 'Seasonal considerations', 'Best times of year, weather patterns, crowd levels', 1),
  ('access_logistics', 'Access or logistics notes', 'Parking, permits, approach routes, facilities', 2),
  ('activity_insight', 'Activity-specific insight', 'Difficulty, gear requirements, technique tips', 3),
  ('planning', 'Planning considerations', 'Day trips vs overnight, group size, time estimates', 4),
  ('safety_conditions', 'Safety or conditions awareness', 'Hazards, current conditions, preparedness', 5);

-- 1.2 Create Trail Blazer Permissions Table
CREATE TABLE trail_blazer_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_attach_external_links boolean DEFAULT false,
  granted_at timestamptz,
  granted_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 1.3 Create Trail Blazer Submission Status Enum
CREATE TYPE trail_blazer_submission_status AS ENUM (
  'pending',
  'approved',
  'needs_revision',
  'declined'
);

-- 1.4 Create Trail Blazer Submissions Table
CREATE TABLE trail_blazer_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who submitted
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What place (required - place-first thinking)
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  google_place_id text NOT NULL,
  place_name text NOT NULL,
  place_address text,
  place_status text DEFAULT 'existing' CHECK (place_status IN ('existing', 'pending')),
  
  -- Contribution scope (multi-select, stored as array)
  context_types text[] NOT NULL,
  
  -- Primary content
  context_text text NOT NULL,
  
  -- Optional external reference (only if permitted)
  has_external_link boolean DEFAULT false,
  external_url text,
  external_content_type text,
  external_summary text,
  
  -- Lifecycle
  status trail_blazer_submission_status DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  admin_notes text,
  revision_feedback text,
  
  -- Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for submissions
CREATE INDEX idx_tb_submissions_user ON trail_blazer_submissions(user_id);
CREATE INDEX idx_tb_submissions_place ON trail_blazer_submissions(place_id);
CREATE INDEX idx_tb_submissions_status ON trail_blazer_submissions(status);
CREATE INDEX idx_tb_submissions_submitted ON trail_blazer_submissions(submitted_at DESC);

-- 1.5 Enable RLS on all tables
ALTER TABLE trail_blazer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_blazer_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_blazer_context_types ENABLE ROW LEVEL SECURITY;

-- RLS for trail_blazer_submissions
CREATE POLICY "Ambassadors can insert own submissions"
  ON trail_blazer_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_role(auth.uid(), 'ambassador')
  );

CREATE POLICY "Users can view own submissions"
  ON trail_blazer_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions"
  ON trail_blazer_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS for trail_blazer_permissions
CREATE POLICY "Users can view own permissions"
  ON trail_blazer_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage permissions"
  ON trail_blazer_permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS for trail_blazer_context_types
CREATE POLICY "Anyone can read active context types"
  ON trail_blazer_context_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage context types"
  ON trail_blazer_context_types FOR ALL
  USING (has_role(auth.uid(), 'admin'));