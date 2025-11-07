-- Ensure a BEFORE INSERT trigger sets user_id from auth
DROP TRIGGER IF EXISTS set_user_id_on_pets ON public.pets;
CREATE TRIGGER set_user_id_on_pets
BEFORE INSERT ON public.pets
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id_from_auth();