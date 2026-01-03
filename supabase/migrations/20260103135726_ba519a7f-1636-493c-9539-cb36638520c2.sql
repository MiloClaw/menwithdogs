-- Create couple_favorites table for saving places
CREATE TABLE public.couple_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(couple_id, place_id)
);

-- Enable RLS
ALTER TABLE public.couple_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for couple_favorites
CREATE POLICY "Couples can insert own favorites"
ON public.couple_favorites FOR INSERT TO authenticated
WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can read own favorites"
ON public.couple_favorites FOR SELECT TO authenticated
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own favorites"
ON public.couple_favorites FOR DELETE TO authenticated
USING (couple_id = get_user_couple_id(auth.uid()));

-- Create event_favorites table for saving events
CREATE TABLE public.event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(couple_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_favorites
CREATE POLICY "Couples can insert own event favorites"
ON public.event_favorites FOR INSERT TO authenticated
WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can read own event favorites"
ON public.event_favorites FOR SELECT TO authenticated
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own event favorites"
ON public.event_favorites FOR DELETE TO authenticated
USING (couple_id = get_user_couple_id(auth.uid()));