-- Create a sequence for pet ID numbers starting at 10001
CREATE SEQUENCE IF NOT EXISTS pet_id_sequence START WITH 10001;

-- Update the public_id column to use the sequence by default
ALTER TABLE pets 
ALTER COLUMN public_id SET DEFAULT ('PET-' || nextval('pet_id_sequence')::text);

-- Update Pig's public_id to be the first number
UPDATE pets 
SET public_id = 'PET-10001'
WHERE name = 'Pig' 
  AND user_id = 'd62d0b4c-356a-40eb-af79-667f48da87a8';