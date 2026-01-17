-- Add SEO and readability fields to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug) WHERE slug IS NOT NULL;

-- Auto-generate slugs for existing posts
UPDATE public.posts
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || LEFT(id::text, 8)
WHERE slug IS NULL AND type = 'announcement';

-- Extract first 200 chars as excerpt for existing posts without one
UPDATE public.posts
SET excerpt = LEFT(REGEXP_REPLACE(body, '^#+\s*', '', 'g'), 200)
WHERE excerpt IS NULL AND body IS NOT NULL AND type = 'announcement';