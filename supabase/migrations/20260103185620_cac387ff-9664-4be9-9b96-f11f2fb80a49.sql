-- Add admin SELECT policy for places table
-- This is required because the createPlace mutation uses .insert().select()
-- which requires both INSERT and SELECT permissions
CREATE POLICY "Admins can read all places"
ON public.places
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));