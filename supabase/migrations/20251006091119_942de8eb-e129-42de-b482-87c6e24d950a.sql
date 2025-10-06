-- Set user_id automatically from the authenticated user on pets insert
CREATE OR REPLACE FUNCTION public.set_user_id_from_auth()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists for pets table
DROP TRIGGER IF EXISTS set_pets_user_id_before_insert ON public.pets;
CREATE TRIGGER set_pets_user_id_before_insert
BEFORE INSERT ON public.pets
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id_from_auth();