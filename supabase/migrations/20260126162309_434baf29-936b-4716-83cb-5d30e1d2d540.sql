-- Phase 3: Add outdoor decision-style preference columns
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS weather_flexibility text,
ADD COLUMN IF NOT EXISTS gear_readiness text;