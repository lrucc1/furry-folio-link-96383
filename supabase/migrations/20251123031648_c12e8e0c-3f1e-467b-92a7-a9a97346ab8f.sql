-- Fix storage upload policy to match current upload path structure
-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload pet documents" ON storage.objects;

-- Create new policy that allows users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update SELECT policy to allow viewing files in user's own folder
DROP POLICY IF EXISTS "Users can view pet documents" ON storage.objects;

CREATE POLICY "Users can view their pet documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow UPDATE for user's own files
DROP POLICY IF EXISTS "Users can update their pet documents" ON storage.objects;

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow DELETE for user's own files
DROP POLICY IF EXISTS "Users can delete their pet documents" ON storage.objects;

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);