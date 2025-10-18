-- Make email matching case-insensitive for visibility and backfill existing data

-- Update policy to compare using lower(email)
ALTER POLICY "Users can view invites for their pets"
ON public.pet_invites
USING (
  (invited_by = auth.uid())
  OR (
    lower(email) = lower((SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
  )
);

-- Backfill: store emails in lowercase for consistency
UPDATE public.pet_invites
SET email = lower(email)
WHERE email IS NOT NULL;