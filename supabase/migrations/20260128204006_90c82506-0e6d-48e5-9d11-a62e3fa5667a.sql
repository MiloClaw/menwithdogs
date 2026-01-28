-- Migration: Trail Blazer Expert-First Schema Upgrade
-- Updates ambassador_applications and creates 5 new signal tables

-- 1. Update ambassador_applications table
ALTER TABLE ambassador_applications 
  ALTER COLUMN tenure SET DEFAULT 'not_applicable',
  ALTER COLUMN city_name SET DEFAULT 'Not specified';

ALTER TABLE ambassador_applications 
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 2. Create Portfolio Links Table
CREATE TABLE trail_blazer_portfolio_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  url text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN (
    'article_essay',
    'guide_resource',
    'photography',
    'video_multimedia',
    'field_notes',
    'other'
  )),
  notes text,
  submitted_order smallint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE trail_blazer_portfolio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own portfolio links"
  ON trail_blazer_portfolio_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own portfolio links"
  ON trail_blazer_portfolio_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage portfolio links"
  ON trail_blazer_portfolio_links FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 3. Create Identity Signals Table
CREATE TABLE trail_blazer_identity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  role_types text[] NOT NULL DEFAULT '{}',
  other_role_description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);

ALTER TABLE trail_blazer_identity_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own identity signals"
  ON trail_blazer_identity_signals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own identity signals"
  ON trail_blazer_identity_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage identity signals"
  ON trail_blazer_identity_signals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 4. Create Expertise Signals Table
CREATE TABLE trail_blazer_expertise_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  expertise_areas text[] NOT NULL DEFAULT '{}',
  other_expertise_description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);

ALTER TABLE trail_blazer_expertise_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own expertise signals"
  ON trail_blazer_expertise_signals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own expertise signals"
  ON trail_blazer_expertise_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage expertise signals"
  ON trail_blazer_expertise_signals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 5. Create Place Reference Table
CREATE TABLE trail_blazer_place_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  google_place_id text NOT NULL,
  place_name text NOT NULL,
  formatted_address text,
  place_types text[] DEFAULT '{}',
  place_status text NOT NULL DEFAULT 'pending' CHECK (place_status IN (
    'existing',
    'pending',
    'approved',
    'rejected'
  )),
  directory_place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  admin_place_notes text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE trail_blazer_place_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own place references"
  ON trail_blazer_place_references FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own place references"
  ON trail_blazer_place_references FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage place references"
  ON trail_blazer_place_references FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 6. Create Acknowledgements Table
CREATE TABLE trail_blazer_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  ack_place_focus boolean NOT NULL DEFAULT false,
  ack_link_review boolean NOT NULL DEFAULT false,
  ack_no_public_profile boolean NOT NULL DEFAULT false,
  ack_no_promotion_required boolean NOT NULL DEFAULT false,
  acknowledged_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);