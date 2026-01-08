-- Fix Issue 1: storage_usage overly permissive RLS policy
DROP POLICY IF EXISTS "System can update storage usage" ON public.storage_usage;

-- Create restrictive policy that only allows service_role access
-- (The calculate_user_storage function is SECURITY DEFINER so it will still work)
CREATE POLICY "Service role can manage storage usage"
  ON public.storage_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Fix Issue 2: get_pending_deletions lacks admin authorization check
CREATE OR REPLACE FUNCTION public.get_pending_deletions()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  display_name text, 
  deleted_at timestamp with time zone, 
  days_remaining integer, 
  hard_delete_date timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.display_name,
    p.deleted_at,
    GREATEST(0, 30 - EXTRACT(DAY FROM (NOW() - p.deleted_at))::integer) as days_remaining,
    (p.deleted_at + INTERVAL '30 days') as hard_delete_date
  FROM public.profiles p
  WHERE p.deletion_scheduled = true
    AND p.deleted_at IS NOT NULL
    AND p.deleted_at > (NOW() - INTERVAL '30 days')
  ORDER BY p.deleted_at ASC;
END;
$$;