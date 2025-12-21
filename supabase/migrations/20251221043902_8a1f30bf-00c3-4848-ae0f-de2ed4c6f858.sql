-- =============================================
-- MIGRATION: Remove all Stripe-related columns and tables
-- =============================================

-- Drop the stripe_webhook_events table
DROP TABLE IF EXISTS public.stripe_webhook_events;

-- Remove Stripe-related columns from profiles table
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_tier,
  DROP COLUMN IF EXISTS stripe_status,
  DROP COLUMN IF EXISTS stripe_current_period_end,
  DROP COLUMN IF EXISTS latest_invoice_id;

-- Remove Stripe-related column from subscription_tiers table
ALTER TABLE public.subscription_tiers
  DROP COLUMN IF EXISTS stripe_price_id;

-- Update has_active_subscription function to not reference Stripe
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
    AND (
      subscription_status IN ('active', 'trialing')
      OR plan_v2 IN ('PRO', 'TRIAL')
      OR plan_tier IN ('premium', 'family', 'pro')
    )
  )
$function$;