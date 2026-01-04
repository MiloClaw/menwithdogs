-- Create posts table for announcements and events
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('announcement', 'event')),
  title text NOT NULL,
  body text,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  start_date timestamptz,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published, non-expired posts
CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- Admins can manage all posts
CREATE POLICY "Admins can manage posts"
  ON public.posts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop legacy blog_posts table
DROP TABLE IF EXISTS public.blog_posts CASCADE;