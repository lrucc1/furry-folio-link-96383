-- Remove the confusing/ineffective policy
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Create a proper RESTRICTIVE policy that blocks anonymous access
-- RESTRICTIVE policies must ALL pass (AND logic), so this ensures auth.uid() is not null
CREATE POLICY "Require authenticated user for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);