
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;

-- Create a new permissive INSERT policy
CREATE POLICY "Users can insert their own pets" 
ON public.pets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
