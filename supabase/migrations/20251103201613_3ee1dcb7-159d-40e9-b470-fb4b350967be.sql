-- Make pet-documents bucket public so images can display
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pet-documents';