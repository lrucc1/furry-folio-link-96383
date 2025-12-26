-- Add public_token UUID column to pets table
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS public_token uuid DEFAULT gen_random_uuid();

-- Backfill existing rows that have NULL public_token
UPDATE public.pets SET public_token = gen_random_uuid() WHERE public_token IS NULL;

-- Set NOT NULL constraint
ALTER TABLE public.pets ALTER COLUMN public_token SET NOT NULL;

-- Add unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_public_token ON public.pets(public_token);