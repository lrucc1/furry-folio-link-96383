-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill user_id from id column
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Add missing columns to pets table
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS is_lost BOOLEAN DEFAULT false;

-- Create function to get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
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