-- Add missing fields to pets table that are used in the edit form
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS desexed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_provider text,
  ADD COLUMN IF NOT EXISTS insurance_policy text;
