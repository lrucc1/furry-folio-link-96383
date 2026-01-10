-- Fix: Add explicit INSERT policy on user_roles to prevent privilege escalation
-- Only service_role (backend) should be able to insert user roles
-- This prevents users from self-assigning admin or other privileged roles

-- First, drop any existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for users" ON public.user_roles;

-- Create a restrictive INSERT policy that denies all user-initiated inserts
-- Roles should only be assigned through backend/admin operations
CREATE POLICY "No self-assignment of roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Add a comment explaining the security rationale
COMMENT ON POLICY "No self-assignment of roles" ON public.user_roles IS 
'Prevents privilege escalation by blocking all user-initiated role assignments. Roles must be assigned via service_role/admin backend operations.';