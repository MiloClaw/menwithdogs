-- Create city_suggestions table for user-submitted city requests
CREATE TABLE public.city_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id text NOT NULL UNIQUE,
  name text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'US',
  lat numeric,
  lng numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.city_suggestions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own suggestions
CREATE POLICY "Users can submit city suggestions"
ON public.city_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Users can view their own suggestions
CREATE POLICY "Users can view their own city suggestions"
ON public.city_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

-- Admins can view all suggestions
CREATE POLICY "Admins can view all city suggestions"
ON public.city_suggestions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update suggestions (for review)
CREATE POLICY "Admins can update city suggestions"
ON public.city_suggestions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete suggestions
CREATE POLICY "Admins can delete city suggestions"
ON public.city_suggestions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));