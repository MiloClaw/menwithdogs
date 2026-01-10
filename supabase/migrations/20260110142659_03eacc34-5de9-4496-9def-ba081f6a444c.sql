-- Phase 1: Add preference change tracking for affinity cache invalidation
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferences_updated_at timestamptz DEFAULT now();

-- Trigger to auto-update timestamp on any preference change
CREATE OR REPLACE FUNCTION update_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.preferences_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS preferences_change_tracker ON user_preferences;
CREATE TRIGGER preferences_change_tracker
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_timestamp();