-- Pricing v2: Add new plan fields and migrate existing data

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_v2 TEXT CHECK (plan_v2 IN ('FREE', 'PRO', 'TRIAL')),
ADD COLUMN IF NOT EXISTS trial_end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'none')),
ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMP WITH TIME ZONE;

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_v2 ON public.profiles(plan_v2);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_at ON public.profiles(trial_end_at) WHERE trial_end_at IS NOT NULL;

-- Migrate existing users to new plan structure
UPDATE public.profiles
SET 
  plan_v2 = CASE
    -- If they have active Stripe subscription, they're PRO
    WHEN stripe_status IN ('active', 'trialing') THEN 'PRO'
    -- If they have premium or family tier, they're PRO
    WHEN plan_tier IN ('premium', 'family') THEN 'PRO'
    -- If they have manual_override and not free, they're PRO
    WHEN manual_override = true AND plan_tier != 'free' THEN 'PRO'
    -- Everyone else is FREE
    ELSE 'FREE'
  END,
  subscription_status = CASE
    WHEN stripe_status IS NOT NULL THEN stripe_status
    WHEN plan_tier IN ('premium', 'family') THEN 'active'
    ELSE 'none'
  END,
  next_billing_at = stripe_current_period_end
WHERE plan_v2 IS NULL;

-- Set trial_end_at to 7 days from now for new users (will be set by trigger)
-- Existing users don't get trial retroactively

-- Add function to initialize trial for new users
CREATE OR REPLACE FUNCTION public.initialize_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- New users start on TRIAL with 7 days
  NEW.plan_v2 := 'TRIAL';
  NEW.trial_end_at := NOW() + INTERVAL '7 days';
  NEW.subscription_status := 'trialing';
  
  RETURN NEW;
END;
$function$;

-- Create trigger to set trial on new profile creation
DROP TRIGGER IF EXISTS set_trial_on_new_user ON public.profiles;
CREATE TRIGGER set_trial_on_new_user
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_trial();

-- Add storage usage tracking
CREATE TABLE IF NOT EXISTS public.storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storage usage"
  ON public.storage_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update storage usage"
  ON public.storage_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to calculate user storage
CREATE OR REPLACE FUNCTION public.calculate_user_storage(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  total_size BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0)
  INTO total_size
  FROM public.pet_documents
  WHERE user_id = p_user_id;
  
  -- Upsert into storage_usage
  INSERT INTO public.storage_usage (user_id, total_bytes, updated_at)
  VALUES (p_user_id, total_size, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET total_bytes = total_size, updated_at = NOW();
  
  RETURN total_size;
END;
$function$;

-- Trigger to update storage on document changes
CREATE OR REPLACE FUNCTION public.update_storage_on_document_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_user_storage(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM public.calculate_user_storage(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$function$;

DROP TRIGGER IF EXISTS update_storage_on_document_change ON public.pet_documents;
CREATE TRIGGER update_storage_on_document_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pet_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_storage_on_document_change();

-- Create entitlement check functions
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(plan_v2, 'FREE')
  FROM public.profiles
  WHERE id = p_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.check_trial_expired()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- If trial has expired and no subscription, downgrade to FREE
  IF NEW.plan_v2 = 'TRIAL' 
     AND NEW.trial_end_at < NOW() 
     AND (NEW.subscription_status IS NULL OR NEW.subscription_status = 'trialing') THEN
    NEW.plan_v2 := 'FREE';
    NEW.subscription_status := 'none';
    NEW.trial_end_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS check_trial_expired_trigger ON public.profiles;
CREATE TRIGGER check_trial_expired_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trial_expired();