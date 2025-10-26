-- Fix 1: Make pet-documents storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'pet-documents';

-- Fix 2: Drop the overly permissive policy on pets table
DROP POLICY IF EXISTS "Anyone can view pets by public_id" ON public.pets;

-- Ensure storage.objects has proper RLS for pet-documents bucket
DROP POLICY IF EXISTS "Allow public access to pet documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own pet documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own pet documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pet documents" ON storage.objects;

-- Create proper storage policies for pet-documents bucket
CREATE POLICY "Authenticated users can view documents for accessible pets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT pd.id::text 
    FROM public.pet_documents pd
    JOIN public.pets p ON pd.pet_id = p.id
    WHERE has_pet_access(p.id, auth.uid())
  )
);

CREATE POLICY "Authenticated users can upload pet documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update documents for editable pets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT pd.id::text 
    FROM public.pet_documents pd
    JOIN public.pets p ON pd.pet_id = p.id
    WHERE can_edit_pet(p.id, auth.uid())
  )
);

CREATE POLICY "Users can delete documents for editable pets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT pd.id::text 
    FROM public.pet_documents pd
    JOIN public.pets p ON pd.pet_id = p.id
    WHERE can_edit_pet(p.id, auth.uid())
  )
);