-- ═══════════════════════════════════════════════════════════════
-- SEED PLACE CONTEXT PRIORS (~20 priors)
-- Temporary scaffolding with 90-day decay - NOT permanent truth
-- ═══════════════════════════════════════════════════════════════

-- DALLAS PRIORS (city_id: dda219cc-3895-431a-a5f5-863b5fb3e169)
INSERT INTO place_context_priors (place_id, city_id, context_key, confidence) VALUES
  -- Merit Coffee → morning_active, conversation_focused
  ('59378ab9-bb61-4a92-872a-c10c99db00b9', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'morning_active', 0.20),
  ('59378ab9-bb61-4a92-872a-c10c99db00b9', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'conversation_focused', 0.15),
  
  -- Ascension Coffee - Design District → morning_active
  ('dd35f68a-61e5-4879-b77b-b7765544c955', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'morning_active', 0.20),
  
  -- Interabang Books → quiet_spaces, solo_friendly
  ('8bf3f4e6-494c-4047-9752-e81ba16290e5', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'quiet_spaces', 0.20),
  ('8bf3f4e6-494c-4047-9752-e81ba16290e5', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'solo_friendly', 0.15),
  
  -- JR's Bar & Grill → gay_men, community_oriented
  ('35210e03-1846-46e4-bfd1-5f058f40803d', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'gay_men', 0.25),
  ('35210e03-1846-46e4-bfd1-5f058f40803d', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'community_oriented', 0.20),
  
  -- Dallas Zoo → family_friendly, outdoor_friendly
  ('360c4a04-1710-4920-a720-09620594b942', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'family_friendly', 0.25),
  ('360c4a04-1710-4920-a720-09620594b942', 'dda219cc-3895-431a-a5f5-863b5fb3e169', 'outdoor_friendly', 0.20);

-- SEATTLE PRIORS (city_id: cbfc1980-8ca9-4b02-833a-90d6b373e479)
INSERT INTO place_context_priors (place_id, city_id, context_key, confidence) VALUES
  -- Anchorhead Coffee → morning_active, conversation_focused
  ('e017cad0-9704-4365-9a50-2f1588d0e002', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'morning_active', 0.20),
  ('e017cad0-9704-4365-9a50-2f1588d0e002', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'conversation_focused', 0.15),
  
  -- Gas Works Park → outdoor_friendly, routine_driven
  ('ea6484ba-8c29-4baa-9cef-85dfce412d6c', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'outdoor_friendly', 0.25),
  ('ea6484ba-8c29-4baa-9cef-85dfce412d6c', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'routine_driven', 0.15),
  
  -- Madison Pub → gay_men, community_oriented
  ('b5535018-f05a-4f3e-8f7b-9e8e42df5b26', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'gay_men', 0.25),
  ('b5535018-f05a-4f3e-8f7b-9e8e42df5b26', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'community_oriented', 0.20),
  
  -- Paramount Theatre → event_oriented, arts_culture_oriented
  ('323d8821-fbc0-4f32-bccf-1c613bdc7144', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'event_oriented', 0.25),
  ('323d8821-fbc0-4f32-bccf-1c613bdc7144', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'arts_culture_oriented', 0.20),
  
  -- Chihuly Garden and Glass → arts_culture_oriented
  ('4b26e05e-658c-4ec4-8dac-62208090b53e', 'cbfc1980-8ca9-4b02-833a-90d6b373e479', 'arts_culture_oriented', 0.25);