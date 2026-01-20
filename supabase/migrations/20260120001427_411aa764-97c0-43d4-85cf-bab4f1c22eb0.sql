-- Create ambassador_applications table
CREATE TABLE public.ambassador_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  city_name text NOT NULL,
  city_google_place_id text,
  city_state text,
  city_country text NOT NULL DEFAULT 'US',
  tenure text NOT NULL CHECK (tenure IN ('less_than_1_year', '1_3_years', '3_5_years', '5_10_years', '10_plus_years')),
  local_knowledge text NOT NULL,
  social_links text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own applications (authenticated)
CREATE POLICY "Users can submit their own applications"
ON public.ambassador_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.ambassador_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.ambassador_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications (for review)
CREATE POLICY "Admins can update applications"
ON public.ambassador_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add index for status filtering
CREATE INDEX idx_ambassador_applications_status ON public.ambassador_applications(status);

-- Add index for city filtering
CREATE INDEX idx_ambassador_applications_city ON public.ambassador_applications(city_name);