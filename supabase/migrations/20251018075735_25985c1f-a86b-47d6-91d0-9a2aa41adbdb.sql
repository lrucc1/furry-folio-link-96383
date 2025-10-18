-- First, drop any check constraints on plan_tier
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;

-- Consolidate premium_tier into plan_tier
UPDATE profiles 
SET plan_tier = COALESCE(premium_tier, plan_tier, 'free')
WHERE premium_tier IS NOT NULL OR plan_tier IS NULL;

-- Drop the premium_tier column
ALTER TABLE profiles DROP COLUMN IF EXISTS premium_tier;

-- Re-add the check constraint with the correct values
ALTER TABLE profiles 
ADD CONSTRAINT profiles_plan_tier_check 
CHECK (plan_tier IN ('free', 'premium', 'family'));