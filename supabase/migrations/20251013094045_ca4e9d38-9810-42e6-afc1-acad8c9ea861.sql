-- Create storage bucket for pet documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-documents',
  'pet-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for pet documents storage
CREATE POLICY "Users can upload their own pet documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own pet documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own pet documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own pet documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);