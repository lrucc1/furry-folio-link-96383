-- Create helper functions for role-based access control
CREATE OR REPLACE FUNCTION public.has_pet_access(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships WHERE pet_id = _pet_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_pet(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships 
    WHERE pet_id = _pet_id AND user_id = _user_id AND role = 'family'
  )
$$;

-- Update pets table RLS policies
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

CREATE POLICY "Users can view pets they have access to"
ON public.pets FOR SELECT
USING (public.has_pet_access(id, auth.uid()));

CREATE POLICY "Users can update pets they can edit"
ON public.pets FOR UPDATE
USING (public.can_edit_pet(id, auth.uid()));

CREATE POLICY "Users can delete pets they own"
ON public.pets FOR DELETE
USING (auth.uid() = user_id);

-- Update health_reminders table RLS policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.health_reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON public.health_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.health_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.health_reminders;

CREATE POLICY "Users can view reminders for accessible pets"
ON public.health_reminders FOR SELECT
USING (public.has_pet_access(pet_id, auth.uid()));

CREATE POLICY "Users can insert reminders for editable pets"
ON public.health_reminders FOR INSERT
WITH CHECK (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can update reminders for editable pets"
ON public.health_reminders FOR UPDATE
USING (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can delete reminders for editable pets"
ON public.health_reminders FOR DELETE
USING (public.can_edit_pet(pet_id, auth.uid()));

-- Update vaccinations table RLS policies
DROP POLICY IF EXISTS "Users can view their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can insert their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can update their own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can delete their own vaccinations" ON public.vaccinations;

CREATE POLICY "Users can view vaccinations for accessible pets"
ON public.vaccinations FOR SELECT
USING (public.has_pet_access(pet_id, auth.uid()));

CREATE POLICY "Users can insert vaccinations for editable pets"
ON public.vaccinations FOR INSERT
WITH CHECK (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can update vaccinations for editable pets"
ON public.vaccinations FOR UPDATE
USING (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can delete vaccinations for editable pets"
ON public.vaccinations FOR DELETE
USING (public.can_edit_pet(pet_id, auth.uid()));

-- Update pet_documents table RLS policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.pet_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.pet_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.pet_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.pet_documents;

CREATE POLICY "Users can view documents for accessible pets"
ON public.pet_documents FOR SELECT
USING (public.has_pet_access(pet_id, auth.uid()));

CREATE POLICY "Users can insert documents for editable pets"
ON public.pet_documents FOR INSERT
WITH CHECK (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can update documents for editable pets"
ON public.pet_documents FOR UPDATE
USING (public.can_edit_pet(pet_id, auth.uid()));

CREATE POLICY "Users can delete documents for editable pets"
ON public.pet_documents FOR DELETE
USING (public.can_edit_pet(pet_id, auth.uid()));