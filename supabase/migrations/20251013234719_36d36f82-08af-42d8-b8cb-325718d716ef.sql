-- Allow admins to manage profiles and user_subscriptions so manual tier changes stick

-- Profiles: add admin SELECT/UPDATE policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = id)
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

-- user_subscriptions: add admin SELECT/INSERT/UPDATE policies
DROP POLICY IF EXISTS "Admins can view any subscription" ON public.user_subscriptions;
CREATE POLICY "Admins can view any subscription"
ON public.user_subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert subscription for any user" ON public.user_subscriptions;
CREATE POLICY "Admins can insert subscription for any user"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any subscription" ON public.user_subscriptions;
CREATE POLICY "Admins can update any subscription"
ON public.user_subscriptions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id)
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
