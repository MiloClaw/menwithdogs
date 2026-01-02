-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read places" ON places;

-- Create new policy: authenticated users see only approved places
CREATE POLICY "Authenticated users can read approved places"
ON places FOR SELECT
TO authenticated
USING (status = 'approved');