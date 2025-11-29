-- Add country_code and timezone fields to profiles for international users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., AU, US, GB)';
COMMENT ON COLUMN public.profiles.timezone IS 'IANA timezone string (e.g., Australia/Melbourne, America/New_York)';