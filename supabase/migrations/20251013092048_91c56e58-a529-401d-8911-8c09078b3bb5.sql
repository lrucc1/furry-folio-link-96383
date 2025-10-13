-- Fix the ambiguous user_id reference in get_all_users_admin function
DROP FUNCTION IF EXISTS public.get_all_users_admin();

CREATE OR REPLACE FUNCTION public.get_all_users_admin()
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, display_name text, premium_tier text, pet_count bigint, roles text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    u.created_at,
    p.display_name,
    p.premium_tier,
    COALESCE(pet_counts.count, 0) as pet_count,
    COALESCE(
      ARRAY_AGG(ur.role::TEXT) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as roles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN (
    SELECT pets.user_id, COUNT(*) as count
    FROM public.pets
    GROUP BY pets.user_id
  ) pet_counts ON u.id = pet_counts.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, u.created_at, p.display_name, p.premium_tier, pet_counts.count
  ORDER BY u.created_at DESC;
END;
$function$;