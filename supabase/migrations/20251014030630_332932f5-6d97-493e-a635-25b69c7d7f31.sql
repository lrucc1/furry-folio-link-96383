-- Sync pet_id_sequence to the current maximum numeric part of existing PET-IDs
SELECT setval(
  'pet_id_sequence',
  COALESCE((
    SELECT MAX((regexp_replace(public_id, '^PET-', ''))::bigint)
    FROM public.pets
    WHERE public_id ~ '^PET-[0-9]+$'
  ), 0),
  true
);

-- Normalize any non-conforming or missing public_id values to the PET-XXXXX format
UPDATE public.pets
SET public_id = 'PET-' || nextval('pet_id_sequence')::text
WHERE public_id IS NULL OR public_id !~ '^PET-[0-9]+$';