-- Remove automatic trial initialization for new users
-- New users should start on FREE plan by default

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS initialize_trial_on_profile_insert ON public.profiles;

-- Update the function to NOT set TRIAL by default
-- Users will get plan_v2 = NULL which defaults to FREE
CREATE OR REPLACE FUNCTION public.initialize_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- New users start on FREE (plan_v2 = NULL defaults to FREE in frontend)
  -- Trial can be enabled manually or via upgrade flow
  NEW.plan_v2 := NULL;
  NEW.trial_end_at := NULL;
  NEW.subscription_status := 'none';
  
  RETURN NEW;
END;
$function$;