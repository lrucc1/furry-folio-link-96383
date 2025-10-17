-- Create pet_invites table
CREATE TABLE IF NOT EXISTS public.pet_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('family','caregiver')),
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Create pet_memberships table
CREATE TABLE IF NOT EXISTS public.pet_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','family','caregiver')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(pet_id, user_id)
);

-- Enable RLS
ALTER TABLE public.pet_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_invites
CREATE POLICY "Users can view invites for their pets"
  ON public.pet_invites FOR SELECT
  USING (
    invited_by = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Pet owners can create invites"
  ON public.pet_invites FOR INSERT
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Pet owners can update their invites"
  ON public.pet_invites FOR UPDATE
  USING (invited_by = auth.uid());

CREATE POLICY "Pet owners can delete their invites"
  ON public.pet_invites FOR DELETE
  USING (invited_by = auth.uid());

-- RLS Policies for pet_memberships
CREATE POLICY "Users can view memberships for their pets"
  ON public.pet_memberships FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
  );

CREATE POLICY "Pet owners can create memberships"
  ON public.pet_memberships FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
  );

CREATE POLICY "Pet owners can delete memberships"
  ON public.pet_memberships FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS pet_invites_token_idx ON public.pet_invites(token);
CREATE INDEX IF NOT EXISTS pet_invites_pet_idx ON public.pet_invites(pet_id);
CREATE INDEX IF NOT EXISTS pet_memberships_pet_idx ON public.pet_memberships(pet_id);
CREATE INDEX IF NOT EXISTS pet_memberships_user_idx ON public.pet_memberships(user_id);