-- ═══════════════════════════════════════════════════════════════
-- SEED PRO CONTEXT DEFINITIONS (26 total)
-- Hierarchical vocabulary for Pro place personalization
-- ═══════════════════════════════════════════════════════════════

-- LEVEL 1 — Life Rhythm & Social Energy (10 contexts, domain: activity)
-- These are UNIVERSAL human patterns - largest audience first
INSERT INTO pro_context_definitions (key, domain, description, is_sensitive, default_confidence_cap, is_active) VALUES
  ('morning_active', 'activity', 'User prefers morning routines and early social settings', false, 0.25, true),
  ('evening_social', 'activity', 'User gravitates toward evening and nightlife venues', false, 0.25, true),
  ('weekend_focused', 'activity', 'Activity patterns concentrate on weekends', false, 0.25, true),
  ('routine_driven', 'activity', 'Prefers familiar, recurring spots over novelty', false, 0.25, true),
  ('spontaneous', 'activity', 'Open to new places and last-minute plans', false, 0.25, true),
  ('conversation_focused', 'activity', 'Seeks venues conducive to talking and connection', false, 0.25, true),
  ('low_pressure_social', 'activity', 'Prefers casual, low-stakes social environments', false, 0.25, true),
  ('community_oriented', 'activity', 'Values regular, gathering-oriented spaces', false, 0.25, true),
  ('solo_friendly', 'activity', 'Comfortable in venues suited for one person', false, 0.25, true),
  ('event_oriented', 'activity', 'Drawn to venues that host events and programming', false, 0.25, true);

-- LEVEL 2 — Environment & Lifestyle Structure (8 contexts, domain: lifestyle)
-- How life is structured, not who someone is
INSERT INTO pro_context_definitions (key, domain, description, is_sensitive, default_confidence_cap, is_active) VALUES
  ('quiet_spaces', 'lifestyle', 'Prefers calm, low-noise environments', false, 0.25, true),
  ('energetic_spaces', 'lifestyle', 'Drawn to lively, buzzing atmospheres', false, 0.25, true),
  ('outdoor_friendly', 'lifestyle', 'Values patios, parks, and open-air venues', false, 0.25, true),
  ('cozy_intimate', 'lifestyle', 'Prefers small, warm, close-quarters settings', false, 0.25, true),
  ('dog_owner', 'lifestyle', 'Needs dog-friendly or dog-centric venues', false, 0.25, true),
  ('sober', 'lifestyle', 'Prefers substance-free or low-alcohol environments', true, 0.20, true),
  ('travel_focused', 'lifestyle', 'Frequently exploring new cities or neighborhoods', false, 0.25, true),
  ('home_base_local', 'lifestyle', 'Strong preference for neighborhood regulars', false, 0.25, true);

-- LEVEL 3 — Values & Comfort (4 contexts)
-- Optional layer - some sensitive
INSERT INTO pro_context_definitions (key, domain, description, is_sensitive, default_confidence_cap, is_active) VALUES
  ('faith_adjacent', 'faith', 'Seeks spaces aligned with spiritual or religious values', true, 0.20, true),
  ('substance_free_spaces', 'faith', 'Strong preference for alcohol-free venues', true, 0.20, true),
  ('family_friendly', 'community', 'Prefers venues welcoming to children and families', false, 0.25, true),
  ('arts_culture_oriented', 'community', 'Drawn to museums, galleries, and creative venues', false, 0.25, true);

-- LEVEL 4 — Community-Centered Spaces (2 contexts, domain: community)
-- Niche, optional - framed as "spaces that center X" not "people who are X"
INSERT INTO pro_context_definitions (key, domain, description, is_sensitive, default_confidence_cap, is_active) VALUES
  ('lgbtq_plus', 'community', 'Spaces that center LGBTQ+ community', true, 0.20, true),
  ('gay_men', 'community', 'Spaces that specifically center gay men', true, 0.20, true);