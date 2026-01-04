-- ============================================================
-- SPRINT 3: GEOGRAPHY SYSTEM (GOOGLE-ALIGNED)
-- ============================================================

-- 3.1 Create geo_areas table (Google-Aligned Hierarchy)
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN (
    'country', 'admin_area_1', 'admin_area_2', 
    'locality', 'sublocality', 'neighborhood', 'postal_code'
  )),
  name text NOT NULL,
  slug text GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED,
  parent_id uuid REFERENCES geo_areas(id) ON DELETE SET NULL,
  google_place_id text,
  centroid_lat numeric,
  centroid_lng numeric,
  bounds_json jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Composite unique to prevent duplicates
  UNIQUE (type, name, parent_id)
);

-- Indexes for geo_areas
CREATE INDEX IF NOT EXISTS idx_geo_type ON geo_areas (type);
CREATE INDEX IF NOT EXISTS idx_geo_parent ON geo_areas (parent_id);
CREATE INDEX IF NOT EXISTS idx_geo_active ON geo_areas (is_active);
CREATE INDEX IF NOT EXISTS idx_geo_google_id ON geo_areas (google_place_id);
CREATE INDEX IF NOT EXISTS idx_geo_slug ON geo_areas (slug);

-- Enable RLS on geo_areas
ALTER TABLE geo_areas ENABLE ROW LEVEL SECURITY;

-- Public read for active geo areas
CREATE POLICY "Anyone can read active geo areas" ON geo_areas
  FOR SELECT USING (is_active = true);

-- Admin can manage all
CREATE POLICY "Admins can manage geo areas" ON geo_areas
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3.2 Create place_geo_areas table (Attachments)
-- ============================================================

CREATE TABLE IF NOT EXISTS place_geo_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  geo_area_id uuid NOT NULL REFERENCES geo_areas(id) ON DELETE CASCADE,
  confidence numeric DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source text NOT NULL CHECK (source IN (
    'google_components', 'polygon', 'nearest', 'admin_override'
  )),
  created_at timestamptz DEFAULT now(),
  UNIQUE (place_id, geo_area_id)
);

-- Indexes for place_geo_areas
CREATE INDEX IF NOT EXISTS idx_place_geo_place ON place_geo_areas (place_id);
CREATE INDEX IF NOT EXISTS idx_place_geo_area ON place_geo_areas (geo_area_id);
CREATE INDEX IF NOT EXISTS idx_place_geo_source ON place_geo_areas (source);

-- Enable RLS on place_geo_areas
ALTER TABLE place_geo_areas ENABLE ROW LEVEL SECURITY;

-- Public read for place geo areas (directory needs this)
CREATE POLICY "Anyone can read place geo areas" ON place_geo_areas
  FOR SELECT USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage place geo areas" ON place_geo_areas
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3.3 Add city_geo_area_id to couples table
-- ============================================================

ALTER TABLE couples ADD COLUMN IF NOT EXISTS city_geo_area_id uuid REFERENCES geo_areas(id) ON DELETE SET NULL;

-- 3.4 Trigger to update updated_at on geo_areas
-- ============================================================

CREATE TRIGGER update_geo_areas_timestamp
  BEFORE UPDATE ON geo_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_taxonomy_node_updated_at();