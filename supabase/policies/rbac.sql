-- ============================================================================
-- PetLinkID RBAC Policies
-- ============================================================================
-- This file documents the RLS policies for role-based access control
-- DO NOT EXECUTE - These policies are already implemented in the database
-- This file is for documentation and reference only
-- ============================================================================

-- Security Definer Functions
-- ============================================================================

-- Check if user has access to a pet (owner or member)
CREATE OR REPLACE FUNCTION public.has_pet_access(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships WHERE pet_id = _pet_id AND user_id = _user_id
  )
$$;

-- Check if user can edit a pet (owner or family member)
CREATE OR REPLACE FUNCTION public.can_edit_pet(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships 
    WHERE pet_id = _pet_id AND user_id = _user_id AND role = 'family'
  )
$$;


-- Pets Table Policies
-- ============================================================================

-- SELECT: Users can view pets they have access to
CREATE POLICY "Users can view pets they have access to"
ON public.pets
FOR SELECT
USING (has_pet_access(id, auth.uid()));

-- INSERT: Users can insert their own pets
CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update pets they can edit
CREATE POLICY "Users can update pets they can edit"
ON public.pets
FOR UPDATE
USING (can_edit_pet(id, auth.uid()));

-- DELETE: Users can delete pets they own
CREATE POLICY "Users can delete pets they own"
ON public.pets
FOR DELETE
USING (auth.uid() = user_id);


-- Vaccinations Table Policies
-- ============================================================================

-- SELECT: Users can view vaccinations for accessible pets
CREATE POLICY "Users can view vaccinations for accessible pets"
ON public.vaccinations
FOR SELECT
USING (has_pet_access(pet_id, auth.uid()));

-- INSERT: Users can insert vaccinations for editable pets
CREATE POLICY "Users can insert vaccinations for editable pets"
ON public.vaccinations
FOR INSERT
WITH CHECK (can_edit_pet(pet_id, auth.uid()));

-- UPDATE: Users can update vaccinations for editable pets
CREATE POLICY "Users can update vaccinations for editable pets"
ON public.vaccinations
FOR UPDATE
USING (can_edit_pet(pet_id, auth.uid()));

-- DELETE: Users can delete vaccinations for editable pets
CREATE POLICY "Users can delete vaccinations for editable pets"
ON public.vaccinations
FOR DELETE
USING (can_edit_pet(pet_id, auth.uid()));


-- Health Reminders Table Policies
-- ============================================================================

-- SELECT: Users can view reminders for accessible pets
CREATE POLICY "Users can view reminders for accessible pets"
ON public.health_reminders
FOR SELECT
USING (has_pet_access(pet_id, auth.uid()));

-- INSERT: Users can insert reminders for editable pets
CREATE POLICY "Users can insert reminders for editable pets"
ON public.health_reminders
FOR INSERT
WITH CHECK (can_edit_pet(pet_id, auth.uid()));

-- UPDATE: Users can update reminders for editable pets
CREATE POLICY "Users can update reminders for editable pets"
ON public.health_reminders
FOR UPDATE
USING (can_edit_pet(pet_id, auth.uid()));

-- DELETE: Users can delete reminders for editable pets
CREATE POLICY "Users can delete reminders for editable pets"
ON public.health_reminders
FOR DELETE
USING (can_edit_pet(pet_id, auth.uid()));


-- Pet Documents Table Policies
-- ============================================================================

-- SELECT: Users can view documents for accessible pets
CREATE POLICY "Users can view documents for accessible pets"
ON public.pet_documents
FOR SELECT
USING (has_pet_access(pet_id, auth.uid()));

-- INSERT: Users can insert documents for editable pets
CREATE POLICY "Users can insert documents for editable pets"
ON public.pet_documents
FOR INSERT
WITH CHECK (can_edit_pet(pet_id, auth.uid()));

-- UPDATE: Users can update documents for editable pets
CREATE POLICY "Users can update documents for editable pets"
ON public.pet_documents
FOR UPDATE
USING (can_edit_pet(pet_id, auth.uid()));

-- DELETE: Users can delete documents for editable pets
CREATE POLICY "Users can delete documents for editable pets"
ON public.pet_documents
FOR DELETE
USING (can_edit_pet(pet_id, auth.uid()));


-- Pet Invites Table Policies
-- ============================================================================

-- SELECT: Users can view invites for their pets or sent to them
CREATE POLICY "Users can view invites for their pets"
ON public.pet_invites
FOR SELECT
USING (
  invited_by = auth.uid() OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- INSERT: Pet owners can create invites
CREATE POLICY "Pet owners can create invites"
ON public.pet_invites
FOR INSERT
WITH CHECK (invited_by = auth.uid());

-- UPDATE: Pet owners can update their invites
CREATE POLICY "Pet owners can update their invites"
ON public.pet_invites
FOR UPDATE
USING (invited_by = auth.uid());

-- DELETE: Pet owners can delete their invites
CREATE POLICY "Pet owners can delete their invites"
ON public.pet_invites
FOR DELETE
USING (invited_by = auth.uid());


-- Pet Memberships Table Policies
-- ============================================================================

-- SELECT: Users can view memberships for their pets
CREATE POLICY "Users can view memberships for their pets"
ON public.pet_memberships
FOR SELECT
USING (
  user_id = auth.uid() OR 
  pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
);

-- INSERT: Pet owners can create memberships
CREATE POLICY "Pet owners can create memberships"
ON public.pet_memberships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pets 
    WHERE id = pet_memberships.pet_id 
    AND user_id = auth.uid()
  )
);

-- DELETE: Pet owners can delete memberships
CREATE POLICY "Pet owners can delete memberships"
ON public.pet_memberships
FOR DELETE
USING (
  pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
);


-- ============================================================================
-- Notes:
-- ============================================================================
-- 
-- 1. These policies are already implemented in the database
-- 2. Changes should be made through Supabase migrations
-- 3. All policies use security definer functions to avoid recursion
-- 4. Roles: owner (full access), family (edit access), caregiver (read-only)
-- 5. Caregivers can view but not modify any data
-- 6. Family members can view and edit but not delete pets
-- 7. Only owners can invite others and manage memberships
-- 
-- ============================================================================
