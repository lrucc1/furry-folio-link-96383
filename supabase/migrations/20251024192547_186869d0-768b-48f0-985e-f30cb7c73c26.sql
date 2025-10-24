-- Fix the glitched pet ID for Max
UPDATE pets 
SET public_id = 'PET-10003'
WHERE id = '3be2bc84-adc7-48a7-bf90-2b54783b73dc' AND public_id = 'epqb3nuz2';

-- Make sure the sequence is at the right value
SELECT setval('pet_id_sequence', 10003, true);