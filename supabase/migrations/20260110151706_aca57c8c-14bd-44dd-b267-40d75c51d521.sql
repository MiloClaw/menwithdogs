-- Create post_tags junction table for many-to-many relationship between posts and interests
CREATE TABLE public.post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  interest_id text NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, interest_id)
);

-- Enable RLS
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags for published posts only
CREATE POLICY "Anyone can read published post tags"
  ON public.post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_tags.post_id 
      AND posts.status = 'published'
    )
  );

-- Admins can manage all post tags
CREATE POLICY "Admins can manage post tags"
  ON public.post_tags FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));