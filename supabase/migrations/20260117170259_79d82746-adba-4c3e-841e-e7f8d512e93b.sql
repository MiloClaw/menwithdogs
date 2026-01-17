-- Create post_places junction table for linking multiple places to posts
CREATE TABLE public.post_places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  context_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, place_id)
);

-- Create index for efficient queries
CREATE INDEX idx_post_places_post_id ON public.post_places(post_id);
CREATE INDEX idx_post_places_place_id ON public.post_places(place_id);

-- Enable RLS
ALTER TABLE public.post_places ENABLE ROW LEVEL SECURITY;

-- Admins can manage all post_places
CREATE POLICY "Admins can manage post places"
  ON public.post_places
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read post_places for published posts
CREATE POLICY "Anyone can read published post places"
  ON public.post_places
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_places.post_id
      AND posts.status = 'published'
    )
  );