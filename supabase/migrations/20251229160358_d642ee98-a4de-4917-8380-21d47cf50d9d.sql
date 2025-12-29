-- Add UPDATE policy for suggested_connections to allow opt-in
CREATE POLICY "Couples can opt-in to suggestions"
ON public.suggested_connections
FOR UPDATE
USING (
  recipient_couple_id = get_user_couple_id(auth.uid()) 
  OR candidate_couple_id = get_user_couple_id(auth.uid())
)
WITH CHECK (
  recipient_couple_id = get_user_couple_id(auth.uid()) 
  OR candidate_couple_id = get_user_couple_id(auth.uid())
);