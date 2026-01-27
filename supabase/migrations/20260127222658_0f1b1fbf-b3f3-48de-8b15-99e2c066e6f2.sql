-- Create tag_pages table for dedicated tag content pages
CREATE TABLE public.tag_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_slug TEXT NOT NULL REFERENCES public.canonical_tags(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  body_markdown TEXT NOT NULL,
  external_link_url TEXT,
  external_link_label TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tag_slug)
);

-- Enable RLS
ALTER TABLE public.tag_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Anyone can read published tag pages"
  ON public.tag_pages FOR SELECT
  USING (is_published = true);

-- Admins can manage all tag pages
CREATE POLICY "Admins can manage tag pages"
  ON public.tag_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add has_page flag to canonical_tags
ALTER TABLE public.canonical_tags
ADD COLUMN has_page BOOLEAN DEFAULT false;