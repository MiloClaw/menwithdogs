-- Allow authenticated users to submit places (restricted to user_submitted source and pending status)
CREATE POLICY "Authenticated users can submit places"
ON public.places
FOR INSERT
TO authenticated
WITH CHECK (
  source = 'user_submitted'::place_source 
  AND status = 'pending'::place_status
  AND submitted_by = auth.uid()
);