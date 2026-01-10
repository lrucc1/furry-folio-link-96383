-- Deny anonymous access to profiles table
-- This prevents unauthenticated scraping of user data
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR SELECT
TO anon
USING (false);