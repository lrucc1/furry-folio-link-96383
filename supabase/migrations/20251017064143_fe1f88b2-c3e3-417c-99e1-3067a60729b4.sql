-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invites for their pets" ON public.pet_invites;
DROP POLICY IF EXISTS "Pet owners can create invites" ON public.pet_invites;
DROP POLICY IF EXISTS "Invite creators can update their invites" ON public.pet_invites;
DROP POLICY IF EXISTS "Invite creators can delete their invites" ON public.pet_invites;
DROP POLICY IF EXISTS "Users can view memberships for their pets" ON public.pet_memberships;
DROP POLICY IF EXISTS "System can insert memberships" ON public.pet_memberships;
DROP POLICY IF EXISTS "Pet owners can delete memberships" ON public.pet_memberships;

-- Recreate policies for pet_invites
CREATE POLICY "Users can view invites for their pets"
  ON public.pet_invites FOR SELECT
  USING (
    invited_by = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Pet owners can create invites"
  ON public.pet_invites FOR INSERT
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Invite creators can update their invites"
  ON public.pet_invites FOR UPDATE
  USING (invited_by = auth.uid());

CREATE POLICY "Invite creators can delete their invites"
  ON public.pet_invites FOR DELETE
  USING (invited_by = auth.uid());

-- Recreate policies for pet_memberships
CREATE POLICY "Users can view memberships for their pets"
  ON public.pet_memberships FOR SELECT
  USING (
    user_id = auth.uid() OR
    pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert memberships"
  ON public.pet_memberships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Pet owners can delete memberships"
  ON public.pet_memberships FOR DELETE
  USING (
    pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid())
  );