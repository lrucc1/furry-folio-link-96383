-- Update subscription tier prices to 2025 rates
-- Premium: $4.49/month, $48.44/year
-- Family: $7.99/month, $86.29/year
-- Also set Stripe monthly price IDs

-- Ensure table exists (no structural changes) and update rows by name
UPDATE public.subscription_tiers
SET 
  price_monthly = 4.49,
  price_yearly = 48.44,
  stripe_price_id = 'price_1SJk4yEhyEZfSSpN8x8KqTGY'
WHERE lower(name) = 'premium';

UPDATE public.subscription_tiers
SET 
  price_monthly = 7.99,
  price_yearly = 86.29,
  stripe_price_id = 'price_1SJk5TEhyEZfSSpNKpDL6ZyO'
WHERE lower(name) = 'family';

-- Keep Free at $0
UPDATE public.subscription_tiers
SET 
  price_monthly = 0,
  price_yearly = 0,
  stripe_price_id = NULL
WHERE lower(name) = 'free';