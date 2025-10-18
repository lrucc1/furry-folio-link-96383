-- Add 'vet' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vet';

-- Create a trigger to handle vet user creation when accepting vet invites
CREATE OR REPLACE FUNCTION public.handle_vet_invite_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is a vet role and the invite was just accepted
  IF NEW.role = 'vet' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get the user_id from the membership that was just created
    DECLARE
      v_user_id UUID;
    BEGIN
      SELECT user_id INTO v_user_id
      FROM public.pet_memberships
      WHERE pet_id = NEW.pet_id
      AND user_id IN (SELECT id FROM auth.users WHERE email = NEW.email);
      
      -- Add vet role to user_roles if found
      IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'vet'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for vet invite acceptance
DROP TRIGGER IF EXISTS on_vet_invite_accepted ON public.pet_invites;
CREATE TRIGGER on_vet_invite_accepted
  AFTER UPDATE ON public.pet_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vet_invite_acceptance();