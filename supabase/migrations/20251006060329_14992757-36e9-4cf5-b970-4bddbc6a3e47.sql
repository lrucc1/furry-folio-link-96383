-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC,
  max_pets INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers"
ON public.subscription_tiers
FOR SELECT
USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_yearly, max_pets, features) VALUES
('free', 0, 0, 3, '["Up to 3 pets", "Basic pet profiles", "Lost pet alerts", "Health reminders"]'::jsonb),
('premium', 9.99, 99.99, -1, '["Unlimited pets", "Family sharing (up to 5 members)", "Custom lost pet posters", "Document storage (50MB)", "Priority support", "Advanced health tracking"]'::jsonb),
('family', 14.99, 149.99, -1, '["Unlimited pets", "Family sharing (up to 10 members)", "Custom lost pet posters", "Document storage (200MB)", "Priority support", "Advanced health tracking", "Multiple households"]'::jsonb);

-- Create pet_documents table for file storage
CREATE TABLE public.pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pet_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
ON public.pet_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.pet_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.pet_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.pet_documents
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_pet_documents_updated_at
BEFORE UPDATE ON public.pet_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create family_members table for family sharing
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id, member_email)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family connections"
ON public.family_members
FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = member_user_id);

CREATE POLICY "Users can invite family members"
ON public.family_members
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their family invitations"
ON public.family_members
FOR UPDATE
USING (auth.uid() = owner_id OR auth.uid() = member_user_id);

CREATE POLICY "Users can delete their family connections"
ON public.family_members
FOR DELETE
USING (auth.uid() = owner_id);