-- ============================================================
-- SPRINT 2: TAXONOMY SYSTEM (GOOGLE-ALIGNED)
-- ============================================================

-- 2.1 Create taxonomy_nodes table (Hierarchical UX Taxonomy)
-- ============================================================

CREATE TABLE IF NOT EXISTS taxonomy_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('interest', 'category', 'subcategory')),
  name text NOT NULL,
  slug text GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED,
  parent_id uuid REFERENCES taxonomy_nodes(id) ON DELETE SET NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for taxonomy_nodes
CREATE INDEX IF NOT EXISTS idx_taxonomy_parent ON taxonomy_nodes (parent_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_active ON taxonomy_nodes (is_active);
CREATE INDEX IF NOT EXISTS idx_taxonomy_kind ON taxonomy_nodes (kind);
CREATE INDEX IF NOT EXISTS idx_taxonomy_slug ON taxonomy_nodes (slug);

-- Enable RLS on taxonomy_nodes
ALTER TABLE taxonomy_nodes ENABLE ROW LEVEL SECURITY;

-- Public read for active taxonomy nodes
CREATE POLICY "Anyone can read active taxonomy nodes" ON taxonomy_nodes
  FOR SELECT USING (is_active = true);

-- Admin can manage all
CREATE POLICY "Admins can manage taxonomy nodes" ON taxonomy_nodes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2.2 Create google_type_mappings table (Versioned Translation Layer)
-- ============================================================

CREATE TABLE IF NOT EXISTS google_type_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_type text NOT NULL,
  taxonomy_node_id uuid NOT NULL REFERENCES taxonomy_nodes(id) ON DELETE CASCADE,
  weight numeric DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  is_active boolean DEFAULT true,
  version int DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for google_type_mappings
CREATE INDEX IF NOT EXISTS idx_mappings_google_type ON google_type_mappings (google_type);
CREATE INDEX IF NOT EXISTS idx_mappings_taxonomy_node ON google_type_mappings (taxonomy_node_id);
CREATE INDEX IF NOT EXISTS idx_mappings_active ON google_type_mappings (is_active);

-- Enable RLS on google_type_mappings
ALTER TABLE google_type_mappings ENABLE ROW LEVEL SECURITY;

-- Public read for active mappings (app needs this for filtering)
CREATE POLICY "Anyone can read active mappings" ON google_type_mappings
  FOR SELECT USING (is_active = true);

-- Admin can manage all
CREATE POLICY "Admins can manage mappings" ON google_type_mappings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2.3 Create place_taxonomy table (Computed Assignments)
-- ============================================================

CREATE TABLE IF NOT EXISTS place_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  taxonomy_node_id uuid NOT NULL REFERENCES taxonomy_nodes(id) ON DELETE CASCADE,
  confidence numeric DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source text NOT NULL CHECK (source IN ('google_type_map', 'ai_infer', 'admin_override')),
  computed_at timestamptz DEFAULT now(),
  UNIQUE (place_id, taxonomy_node_id)
);

-- Indexes for place_taxonomy
CREATE INDEX IF NOT EXISTS idx_place_taxonomy_place ON place_taxonomy (place_id);
CREATE INDEX IF NOT EXISTS idx_place_taxonomy_node ON place_taxonomy (taxonomy_node_id);
CREATE INDEX IF NOT EXISTS idx_place_taxonomy_source ON place_taxonomy (source);

-- Enable RLS on place_taxonomy
ALTER TABLE place_taxonomy ENABLE ROW LEVEL SECURITY;

-- Public read for place taxonomy (directory needs this)
CREATE POLICY "Anyone can read place taxonomy" ON place_taxonomy
  FOR SELECT USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage place taxonomy" ON place_taxonomy
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at on taxonomy_nodes
CREATE OR REPLACE FUNCTION update_taxonomy_node_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_taxonomy_nodes_timestamp
  BEFORE UPDATE ON taxonomy_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_taxonomy_node_updated_at();

-- Trigger to update updated_at on google_type_mappings
CREATE TRIGGER update_google_type_mappings_timestamp
  BEFORE UPDATE ON google_type_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_taxonomy_node_updated_at();