-- Add vet clinic address fields to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_name text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_address text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_suburb text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_state text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_postcode text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_lat double precision;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_lng double precision;