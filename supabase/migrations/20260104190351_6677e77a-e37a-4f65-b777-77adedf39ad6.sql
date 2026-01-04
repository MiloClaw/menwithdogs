-- Add 'user_submitted' to place_source enum
ALTER TYPE place_source ADD VALUE IF NOT EXISTS 'user_submitted';