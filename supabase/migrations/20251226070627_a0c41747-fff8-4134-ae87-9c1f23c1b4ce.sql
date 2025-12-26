-- Add explicit admin role checks to all admin SECURITY DEFINER functions
-- This prevents bypassing RLS since SECURITY DEFINER runs with owner privileges

-- Fix get_admin_stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_pets', (SELECT COUNT(*) FROM public.pets),
    'lost_pets', (SELECT COUNT(*) FROM public.pets WHERE is_lost = true),
    'total_vaccinations', 0,
    'premium_users', 0,
    'pets_by_species', (
      SELECT json_object_agg(species, count)
      FROM (
        SELECT species, COUNT(*) as count 
        FROM public.pets 
        GROUP BY species
      ) species_counts
    ),
    'registrations_this_month', (
      SELECT COUNT(*) 
      FROM auth.users 
      WHERE created_at >= date_trunc('month', now())
    ),
    'pets_added_this_month', (
      SELECT COUNT(*) 
      FROM public.pets 
      WHERE created_at >= date_trunc('month', now())
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix get_all_users_admin function
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, display_name text, plan_tier text, pet_count bigint, roles text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    u.created_at,
    p.display_name,
    p.plan_tier,
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
  GROUP BY u.id, u.email, u.created_at, p.display_name, p.plan_tier, pet_counts.count
  ORDER BY u.created_at DESC;
END;
$$;

-- Fix get_user_growth_stats function
CREATE OR REPLACE FUNCTION public.get_user_growth_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'daily_signups', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM auth.users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ) t
    ),
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_this_week', (
      SELECT COUNT(DISTINCT user_id) 
      FROM public.pets 
      WHERE updated_at >= NOW() - INTERVAL '7 days'
    ),
    'active_this_month', (
      SELECT COUNT(DISTINCT user_id) 
      FROM public.pets 
      WHERE updated_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix get_system_activity_stats function
CREATE OR REPLACE FUNCTION public.get_system_activity_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'pets_activity', json_build_object(
      'added_today', (
        SELECT COUNT(*) FROM public.pets 
        WHERE created_at >= CURRENT_DATE
      ),
      'added_this_week', (
        SELECT COUNT(*) FROM public.pets 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ),
      'updated_today', (
        SELECT COUNT(*) FROM public.pets 
        WHERE updated_at >= CURRENT_DATE
      )
    ),
    'health_activity', json_build_object(
      'reminders_created_today', (
        SELECT COUNT(*) FROM public.health_reminders 
        WHERE created_at >= CURRENT_DATE
      ),
      'reminders_completed_today', (
        SELECT COUNT(*) FROM public.health_reminders 
        WHERE updated_at >= CURRENT_DATE AND completed = true
      ),
      'vaccinations_added_today', (
        SELECT COUNT(*) FROM public.vaccinations 
        WHERE created_at >= CURRENT_DATE
      )
    ),
    'lost_pets_trend', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(updated_at) as date,
          COUNT(*) FILTER (WHERE is_lost = true) as lost_count
        FROM public.pets
        WHERE updated_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(updated_at)
        ORDER BY date DESC
        LIMIT 7
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix get_database_stats function
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Explicit admin check to prevent RLS bypass
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'tables', json_build_object(
      'pets', (SELECT COUNT(*) FROM public.pets),
      'profiles', (SELECT COUNT(*) FROM public.profiles),
      'health_reminders', (SELECT COUNT(*) FROM public.health_reminders),
      'vaccinations', (SELECT COUNT(*) FROM public.vaccinations),
      'notifications', (SELECT COUNT(*) FROM public.notifications),
      'pet_documents', (SELECT COUNT(*) FROM public.pet_documents),
      'user_roles', (SELECT COUNT(*) FROM public.user_roles)
    ),
    'storage_stats', json_build_object(
      'total_documents', (SELECT COUNT(*) FROM public.pet_documents),
      'total_size_mb', (
        SELECT COALESCE(SUM(file_size) / 1024.0 / 1024.0, 0)::NUMERIC(10,2)
        FROM public.pet_documents
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;