-- Add place source and status enums
CREATE TYPE public.place_source AS ENUM ('google_places', 'admin');
CREATE TYPE public.place_status AS ENUM ('approved', 'pending', 'rejected');
CREATE TYPE public.event_status AS ENUM ('approved', 'pending', 'rejected');

-- Extend member_profiles with Google Places location data
ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS city_place_id text,
  ADD COLUMN IF NOT EXISTS city_lat numeric,
  ADD COLUMN IF NOT EXISTS city_lng numeric,
  ADD COLUMN IF NOT EXISTS state text;

-- Add new columns to places table for source tracking and approval workflow
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS source place_source NOT NULL DEFAULT 'google_places',
  ADD COLUMN IF NOT EXISTS status place_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_place_id uuid NOT NULL REFERENCES public.places(id),
  name text NOT NULL,
  description text,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone,
  category_tags text[] DEFAULT '{}',
  source place_source NOT NULL DEFAULT 'admin',
  status event_status NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events RLS policies
CREATE POLICY "Authenticated users can read approved events"
  ON public.events FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can read all events"
  ON public.events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create couple_place_likes table
CREATE TABLE public.couple_place_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(couple_id, place_id)
);

-- Enable RLS on couple_place_likes
ALTER TABLE public.couple_place_likes ENABLE ROW LEVEL SECURITY;

-- couple_place_likes RLS policies
CREATE POLICY "Couples can read own place likes"
  ON public.couple_place_likes FOR SELECT
  USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can insert own place likes"
  ON public.couple_place_likes FOR INSERT
  WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own place likes"
  ON public.couple_place_likes FOR DELETE
  USING (couple_id = get_user_couple_id(auth.uid()));

-- Create couple_event_likes table
CREATE TABLE public.couple_event_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(couple_id, event_id)
);

-- Enable RLS on couple_event_likes
ALTER TABLE public.couple_event_likes ENABLE ROW LEVEL SECURITY;

-- couple_event_likes RLS policies
CREATE POLICY "Couples can read own event likes"
  ON public.couple_event_likes FOR SELECT
  USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can insert own event likes"
  ON public.couple_event_likes FOR INSERT
  WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couples can delete own event likes"
  ON public.couple_event_likes FOR DELETE
  USING (couple_id = get_user_couple_id(auth.uid()));

-- Add updated_at trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_couples_updated_at();

-- Add admin INSERT policy for places (currently read-only)
CREATE POLICY "Admins can insert places"
  ON public.places FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update places"
  ON public.places FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete places"
  ON public.places FOR DELETE
  USING (has_role(auth.uid(), 'admin'));