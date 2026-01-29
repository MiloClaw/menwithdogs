-- Add RLS policy to allow anyone to view approved Trail Blazer submissions
CREATE POLICY "Anyone can view approved submissions"
ON trail_blazer_submissions
FOR SELECT
USING (status = 'approved');