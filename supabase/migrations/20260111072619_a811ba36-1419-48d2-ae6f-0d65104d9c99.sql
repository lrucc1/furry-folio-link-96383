-- Drop the overly permissive public INSERT policy
DROP POLICY IF EXISTS "Anyone can submit smart tag interest" ON public.smart_tag_interest;

-- Add comment explaining the table is now protected by Edge Function
COMMENT ON TABLE public.smart_tag_interest IS 'Marketing interest form submissions - protected by rate-limited Edge Function (submit-smart-tag-interest)';