-- Prevent non-admin users from modifying plan/entitlement fields
CREATE OR REPLACE FUNCTION public.prevent_plan_entitlement_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.plan_v2 IS DISTINCT FROM OLD.plan_v2
    OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
    OR NEW.plan_source IS DISTINCT FROM OLD.plan_source
    OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
    OR NEW.plan_updated_at IS DISTINCT FROM OLD.plan_updated_at
    OR NEW.manual_override IS DISTINCT FROM OLD.manual_override
    OR NEW.plan_tier IS DISTINCT FROM OLD.plan_tier
    OR NEW.billing_interval IS DISTINCT FROM OLD.billing_interval
    OR NEW.next_billing_at IS DISTINCT FROM OLD.next_billing_at
    OR NEW.trial_end_at IS DISTINCT FROM OLD.trial_end_at
  THEN
    RAISE EXCEPTION 'Unauthorized plan update';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_plan_entitlement_changes ON public.profiles;

CREATE TRIGGER prevent_plan_entitlement_changes
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_plan_entitlement_changes();

-- Track Apple IAP transaction ownership to prevent replay across accounts
CREATE TABLE IF NOT EXISTS public.apple_iap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_transaction_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.apple_iap_transactions ENABLE ROW LEVEL SECURITY;
