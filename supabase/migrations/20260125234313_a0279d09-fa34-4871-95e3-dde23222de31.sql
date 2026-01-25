-- Create table for trail favorites
CREATE TABLE public.trail_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  trail_id TEXT NOT NULL,
  park_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(couple_id, trail_id)
);

-- Enable RLS
ALTER TABLE public.trail_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies (matching event_favorites pattern)
CREATE POLICY "Couples can read own trail favorites"
  ON public.trail_favorites FOR SELECT
  USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can insert own trail favorites"
  ON public.trail_favorites FOR INSERT
  WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own trail favorites"
  ON public.trail_favorites FOR DELETE
  USING (couple_id = get_user_couple_id(auth.uid()));