-- Add soft delete columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_scheduled BOOLEAN DEFAULT false;

-- Add index for efficient cleanup queries
CREATE INDEX idx_profiles_deletion_scheduled 
ON public.profiles(deletion_scheduled, deleted_at) 
WHERE deletion_scheduled = true;