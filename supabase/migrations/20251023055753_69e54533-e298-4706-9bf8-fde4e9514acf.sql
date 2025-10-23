-- Create legal consents table to track user agreement to terms
CREATE TABLE IF NOT EXISTS public.legal_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms', 'subscription_terms', 'privacy'
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  version TEXT, -- version of terms accepted (e.g., 'v1.0')
  UNIQUE(user_id, consent_type, version)
);

-- Enable RLS
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
ON public.legal_consents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert consents
CREATE POLICY "System can insert consents"
ON public.legal_consents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create webhook events table to track Stripe webhook processing
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL, -- Stripe event ID for idempotency
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT now(),
  payload JSONB NOT NULL,
  error TEXT
);

-- Enable RLS (admin only)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
ON public.stripe_webhook_events FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add subscription tracking fields to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_tier TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_status') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_status TEXT; -- active, trialing, past_due, canceled
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_current_period_end') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_current_period_end TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'latest_invoice_id') THEN
    ALTER TABLE public.profiles ADD COLUMN latest_invoice_id TEXT;
  END IF;
END $$;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON public.profiles(stripe_subscription_id);

-- Create function to get subscription status for feature gating
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
    AND (
      stripe_status IN ('active', 'trialing')
      OR plan_tier IN ('premium', 'family')
    )
  )
$$;