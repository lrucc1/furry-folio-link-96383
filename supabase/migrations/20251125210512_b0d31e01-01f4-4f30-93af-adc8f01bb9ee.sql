-- Add billing_interval column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN billing_interval text;

-- Add index for filtering by billing_interval
CREATE INDEX idx_profiles_billing_interval ON public.profiles(billing_interval);

COMMENT ON COLUMN public.profiles.billing_interval IS 'Billing cycle: monthly or yearly';