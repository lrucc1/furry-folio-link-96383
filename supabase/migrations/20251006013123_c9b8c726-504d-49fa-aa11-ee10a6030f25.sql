-- Add display_name and premium_tier columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free';