-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  phone TEXT,
  suburb TEXT,
  emergency_contact TEXT,
  premium_tier TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  colour TEXT,
  sex TEXT,
  date_of_birth DATE,
  desexed BOOLEAN DEFAULT FALSE NOT NULL,
  microchip_number TEXT,
  registry_name TEXT,
  registry_link TEXT,
  vet_clinic TEXT,
  insurance_provider TEXT,
  insurance_policy TEXT,
  notes TEXT,
  photo_url TEXT,
  is_lost BOOLEAN DEFAULT FALSE NOT NULL,
  public_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for pets
CREATE POLICY "Users can view their own pets"
ON public.pets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
ON public.pets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
ON public.pets
FOR DELETE
USING (auth.uid() = user_id);

-- Allow public access to lost pets for the found pet page
CREATE POLICY "Public can view lost pets"
ON public.pets
FOR SELECT
USING (is_lost = true);

-- Create RLS policies for vaccinations
CREATE POLICY "Users can view vaccinations for their pets"
ON public.vaccinations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = vaccinations.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert vaccinations for their pets"
ON public.vaccinations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = vaccinations.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update vaccinations for their pets"
ON public.vaccinations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = vaccinations.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete vaccinations for their pets"
ON public.vaccinations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = vaccinations.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();