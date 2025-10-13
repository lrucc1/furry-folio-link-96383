-- Enhanced admin analytics functions

-- Function to get user growth over time (last 30 days)
CREATE OR REPLACE FUNCTION public.get_user_growth_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
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

-- Function to get all users with details for admin management
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  display_name TEXT,
  premium_tier TEXT,
  pet_count BIGINT,
  roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    SELECT user_id, COUNT(*) as count
    FROM public.pets
    GROUP BY user_id
  ) pet_counts ON u.id = pet_counts.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, u.created_at, p.display_name, p.premium_tier, pet_counts.count
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to get system activity stats
CREATE OR REPLACE FUNCTION public.get_system_activity_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
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

-- Function to get database table stats
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
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