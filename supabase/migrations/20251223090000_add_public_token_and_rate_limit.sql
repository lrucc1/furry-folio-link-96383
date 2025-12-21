-- Add non-guessable public token for pet lookup
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();

UPDATE public.pets
SET public_token = gen_random_uuid()
WHERE public_token IS NULL;

ALTER TABLE public.pets
  ALTER COLUMN public_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_public_token ON public.pets(public_token);

-- Add rate-limit tracking for public pet lookups
CREATE TABLE IF NOT EXISTS public.public_pet_lookup_limits (
  ip_address TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ip_address, window_start)
);

ALTER TABLE public.public_pet_lookup_limits ENABLE ROW LEVEL SECURITY;
