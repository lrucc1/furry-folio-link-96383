-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table to manage access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create admin statistics view function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_pets', (SELECT COUNT(*) FROM pets),
    'lost_pets', (SELECT COUNT(*) FROM pets WHERE is_lost = true),
    'total_vaccinations', (SELECT COUNT(*) FROM vaccinations),
    'premium_users', (SELECT COUNT(*) FROM profiles WHERE premium_tier != 'free'),
    'pets_by_species', (
      SELECT json_object_agg(species, count)
      FROM (
        SELECT species, COUNT(*) as count
        FROM pets
        GROUP BY species
      ) species_counts
    ),
    'registrations_this_month', (
      SELECT COUNT(*)
      FROM profiles
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'pets_added_this_month', (
      SELECT COUNT(*)
      FROM pets
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    )
  )
$$;

-- Grant execute permission to authenticated users (will be restricted by RLS in application)
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;