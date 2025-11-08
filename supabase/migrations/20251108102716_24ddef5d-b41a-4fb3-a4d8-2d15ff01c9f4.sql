-- Create function to get pending account deletions with days remaining
CREATE OR REPLACE FUNCTION public.get_pending_deletions()
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  deleted_at timestamp with time zone,
  days_remaining integer,
  hard_delete_date timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;