-- Fix the broken RLS policy that's causing 403 errors
-- The issue is that the policy tries to query auth.users table which users can't access
-- Instead, we'll use the JWT token's email claim

DROP POLICY "Users can view invites for their pets" ON public.pet_invites;

CREATE POLICY "Users can view invites for their pets"
ON public.pet_invites
FOR SELECT
USING (
  -- User can see invites they sent
  (invited_by = auth.uid())
  OR
  -- User can see invites sent to their email (using JWT email claim)
  (lower(email) = lower(auth.jwt() ->> 'email'))
);