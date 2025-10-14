-- Add registry fields to pets table for live registry links
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS registry_name text,
  ADD COLUMN IF NOT EXISTS registry_link text;

-- No changes to RLS needed; existing policies already cover pets table.
