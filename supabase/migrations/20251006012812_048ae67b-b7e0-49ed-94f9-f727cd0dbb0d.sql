-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free';

-- Create vaccinations table for health reminders
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on vaccinations table
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vaccinations
CREATE POLICY "Users can view their own vaccinations"
  ON public.vaccinations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaccinations"
  ON public.vaccinations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations"
  ON public.vaccinations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations"
  ON public.vaccinations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();