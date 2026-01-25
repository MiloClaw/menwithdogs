-- Phase 1 & 2: Update existing lifestyle definitions and add Google type mappings

-- Add maps_to_google_types column for place type matching
ALTER TABLE pro_context_definitions 
ADD COLUMN IF NOT EXISTS maps_to_google_types text[] DEFAULT '{}';

-- Update existing lifestyle definitions to appear in Step 4 with proper section
UPDATE pro_context_definitions 
SET 
  step = 4,
  section = 'style.activity',
  input_type = 'multi',
  sort_order = 40,
  influence_mode = 'boost',
  maps_to_google_types = '{hiking_area,campground,national_park,park}'
WHERE key = 'hiker';

UPDATE pro_context_definitions 
SET 
  step = 4,
  section = 'style.activity',
  input_type = 'multi',
  sort_order = 41,
  influence_mode = 'boost',
  maps_to_google_types = '{hiking_area,park,athletic_field}'
WHERE key = 'runner';

UPDATE pro_context_definitions 
SET 
  step = 4,
  section = 'style.activity',
  input_type = 'multi',
  sort_order = 42,
  influence_mode = 'boost',
  maps_to_google_types = '{hiking_area,park,bicycle_store}'
WHERE key = 'cyclist';

UPDATE pro_context_definitions 
SET 
  step = 4,
  section = 'style.activity',
  input_type = 'multi',
  sort_order = 43,
  influence_mode = 'boost',
  maps_to_google_types = '{park,gym,fitness_center}'
WHERE key = 'outdoor_fitness';

UPDATE pro_context_definitions 
SET 
  step = 4,
  section = 'style.activity',
  input_type = 'multi',
  sort_order = 44,
  influence_mode = 'boost',
  maps_to_google_types = '{beach,swimming_pool,water_park}'
WHERE key = 'swimmer';

-- Phase 3: Create place_niche_tags table (locked behind feature flag)
CREATE TABLE IF NOT EXISTS place_niche_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  confidence numeric DEFAULT 0.5,
  evidence_type text, -- 'admin_curated', 'user_reported', 'inferred'
  evidence_ref text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(place_id, tag)
);

-- RLS: Admin only initially (feature flagged off in code)
ALTER TABLE place_niche_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage niche tags" 
ON place_niche_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));