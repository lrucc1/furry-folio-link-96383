-- Enable RLS on smart_tag_interest table
ALTER TABLE smart_tag_interest ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit interest (public form)
CREATE POLICY "Anyone can submit smart tag interest"
  ON smart_tag_interest
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view smart tag interest"
  ON smart_tag_interest
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));