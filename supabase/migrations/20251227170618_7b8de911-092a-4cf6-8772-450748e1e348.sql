-- Create blog_posts table for editorial content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  hero_image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Editorial Team',
  reading_time INTEGER NOT NULL DEFAULT 5,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index on category for filtering
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);

-- Create index on published_at for ordering
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read policy - anyone can read published posts
CREATE POLICY "Blog posts are publicly readable"
ON public.blog_posts
FOR SELECT
USING (true);

-- No public write policies - admin only via service role

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_posts_updated_at();