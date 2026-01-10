-- Fix Issue 3: Make pet-documents bucket private
-- This ensures RLS policies are enforced for all file access
UPDATE storage.buckets 
SET public = false 
WHERE id = 'pet-documents';