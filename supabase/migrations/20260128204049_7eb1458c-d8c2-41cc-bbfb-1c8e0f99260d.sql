-- Enable RLS on trail_blazer_acknowledgements table
ALTER TABLE trail_blazer_acknowledgements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own acknowledgements"
  ON trail_blazer_acknowledgements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own acknowledgements"
  ON trail_blazer_acknowledgements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage acknowledgements"
  ON trail_blazer_acknowledgements FOR ALL
  USING (has_role(auth.uid(), 'admin'));