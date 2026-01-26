-- Extend user_preferences table with profile preference columns
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS place_usage text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timing_preferences text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS openness text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS allow_place_visibility boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.activities IS 'Multi-select: walking_hiking, running, gym_training, climbing, swimming_water, camping, casual_outdoor';
COMMENT ON COLUMN user_preferences.place_usage IS 'Multi-select: routine, solo_time, staying_active, clearing_head, light_social, group_activities';
COMMENT ON COLUMN user_preferences.timing_preferences IS 'Multi-select: early_mornings, late_mornings, afternoons, evenings, weekdays, weekends';
COMMENT ON COLUMN user_preferences.openness IS 'Private only. Multi-select: keep_to_myself, familiar_faces, casual_conversation, open_to_meeting, with_partner_friends';
COMMENT ON COLUMN user_preferences.allow_place_visibility IS 'Opt-in for place-based alignment features. Off by default.';

-- Insert activity preference definitions
INSERT INTO preference_definitions (domain, preference_key, label, maps_to_primary_categories, sort_order, is_active)
VALUES
  ('activity', 'walking_hiking', 'Walking / hiking', ARRAY['Hiking area', 'Trail', 'Park', 'State park', 'National park'], 1, true),
  ('activity', 'running', 'Running', ARRAY['Park', 'Athletic field', 'Trail', 'Track'], 2, true),
  ('activity', 'gym_training', 'Gym / training', ARRAY['Gym', 'Athletic field', 'Sports complex', 'Fitness center'], 3, true),
  ('activity', 'climbing', 'Climbing', ARRAY['Hiking area', 'Gym', 'Rock climbing'], 4, true),
  ('activity', 'swimming_water', 'Swimming / water', ARRAY['Beach', 'Lake', 'Swimming pool', 'River', 'Water park'], 5, true),
  ('activity', 'camping', 'Camping', ARRAY['Campground', 'RV park', 'Camping cabin', 'State park', 'National park'], 6, true),
  ('activity', 'casual_outdoor', 'Casual outdoor time', ARRAY['Park', 'Beach', 'Scenic spot', 'Playground', 'Garden'], 7, true)
ON CONFLICT (preference_key) DO UPDATE SET
  label = EXCLUDED.label,
  maps_to_primary_categories = EXCLUDED.maps_to_primary_categories,
  sort_order = EXCLUDED.sort_order;

-- Insert place usage preference definitions
INSERT INTO preference_definitions (domain, preference_key, label, maps_to_primary_categories, sort_order, is_active)
VALUES
  ('usage', 'routine', 'Part of a routine', ARRAY[]::text[], 10, true),
  ('usage', 'solo_time', 'Solo time', ARRAY[]::text[], 11, true),
  ('usage', 'staying_active', 'Staying active', ARRAY['Gym', 'Athletic field', 'Park', 'Trail', 'Sports complex'], 12, true),
  ('usage', 'clearing_head', 'Clearing my head', ARRAY['Park', 'Scenic spot', 'Beach', 'Trail', 'Lake'], 13, true),
  ('usage', 'light_social', 'Light social energy', ARRAY['Bar', 'Restaurant', 'Brewery', 'Coffee shop'], 14, true),
  ('usage', 'group_activities', 'Group activities', ARRAY['Sports complex', 'Athletic field', 'Park', 'Gym'], 15, true)
ON CONFLICT (preference_key) DO UPDATE SET
  label = EXCLUDED.label,
  maps_to_primary_categories = EXCLUDED.maps_to_primary_categories,
  sort_order = EXCLUDED.sort_order;

-- Insert timing preference definitions  
INSERT INTO preference_definitions (domain, preference_key, label, maps_to_primary_categories, sort_order, is_active)
VALUES
  ('timing', 'early_mornings', 'Early mornings', ARRAY[]::text[], 20, true),
  ('timing', 'late_mornings', 'Late mornings', ARRAY[]::text[], 21, true),
  ('timing', 'afternoons', 'Afternoons', ARRAY[]::text[], 22, true),
  ('timing', 'evenings', 'Evenings', ARRAY[]::text[], 23, true),
  ('timing', 'weekdays', 'Weekdays', ARRAY[]::text[], 24, true),
  ('timing', 'weekends', 'Weekends', ARRAY[]::text[], 25, true)
ON CONFLICT (preference_key) DO UPDATE SET
  label = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order;

-- Insert openness preference definitions (private, no category mapping)
INSERT INTO preference_definitions (domain, preference_key, label, maps_to_primary_categories, sort_order, is_active)
VALUES
  ('openness', 'keep_to_myself', 'I usually keep to myself', ARRAY[]::text[], 30, true),
  ('openness', 'familiar_faces', 'I''m comfortable with familiar faces', ARRAY[]::text[], 31, true),
  ('openness', 'casual_conversation', 'I''m open to casual conversation', ARRAY[]::text[], 32, true),
  ('openness', 'open_to_meeting', 'I''m open to meeting others through shared activities', ARRAY[]::text[], 33, true),
  ('openness', 'with_partner_friends', 'I''m usually out with a partner or friends', ARRAY[]::text[], 34, true)
ON CONFLICT (preference_key) DO UPDATE SET
  label = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order;