-- Make pet-documents bucket public so profile pictures can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pet-documents';