-- Add new columns for recurring events and external URLs
ALTER TABLE public.posts 
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN recurrence_text text,
  ADD COLUMN external_url text;

-- Add URL format validation
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_external_url_format 
  CHECK (external_url IS NULL OR external_url ~ '^https?://');