-- Fix overly permissive RLS policies on multiple tables

-- 1. Fix pets table INSERT policy to enforce ownership
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
CREATE POLICY "Users can insert their own pets"
ON public.pets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Fix plan_audit - restrict to service_role only
DROP POLICY IF EXISTS "System can insert audit entries" ON public.plan_audit;
CREATE POLICY "Service role can insert audit entries"
ON public.plan_audit FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Fix pet_memberships - restrict to service_role only
DROP POLICY IF EXISTS "System can insert memberships" ON public.pet_memberships;
CREATE POLICY "Service role can insert memberships"
ON public.pet_memberships FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Fix reminder_notifications - restrict to service_role only
DROP POLICY IF EXISTS "System can insert notifications" ON public.reminder_notifications;
CREATE POLICY "Service role can insert notifications"
ON public.reminder_notifications FOR INSERT
TO service_role
WITH CHECK (true);