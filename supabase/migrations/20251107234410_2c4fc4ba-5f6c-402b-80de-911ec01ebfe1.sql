DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (true);