-- Allow anonymous users to read approved places (for shareable landing pages)
-- This enables the /love/:placeId route to work for unauthenticated visitors from social media
CREATE POLICY "Anonymous users can read approved places"
  ON public.places
  FOR SELECT
  TO anon
  USING (status = 'approved'::place_status);