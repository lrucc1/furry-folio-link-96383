-- ============================================================================
-- PetLinkID Complete Database Schema Export
-- Generated: 2026-03-21
-- Project: pnlsootdnywbkqnxsqya
-- ============================================================================
-- This file can recreate the entire public schema on a fresh Supabase project.
-- Run in order: enums → sequences → tables → indexes → functions → triggers → RLS → storage
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM TYPES / ENUMS
-- ============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'vet');

-- ============================================================================
-- 2. SEQUENCES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.pet_id_sequence;
CREATE SEQUENCE IF NOT EXISTS public.plan_audit_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.smart_tag_interest_id_seq;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- device_tokens
-- --------------------------------------------------------------------------
CREATE TABLE public.device_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

-- --------------------------------------------------------------------------
-- family_members
-- --------------------------------------------------------------------------
CREATE TABLE public.family_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending'::text,
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE (owner_id, member_email)
);

-- --------------------------------------------------------------------------
-- pets
-- --------------------------------------------------------------------------
CREATE TABLE public.pets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_id text NOT NULL DEFAULT ('PET-'::text || (nextval('pet_id_sequence'::regclass))::text) UNIQUE,
  public_token uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age_years integer,
  age_months integer,
  date_of_birth date,
  gender text,
  color text,
  weight_kg numeric,
  microchip_number text,
  photo_url text,
  status text DEFAULT 'safe'::text,
  is_lost boolean DEFAULT false,
  desexed boolean DEFAULT false,
  medical_conditions text,
  medications text,
  allergies text,
  vet_name text,
  vet_phone text,
  vet_email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  registry_name text,
  registry_link text,
  insurance_provider text,
  insurance_policy text,
  clinic_name text,
  clinic_address text,
  clinic_suburb text,
  clinic_state text,
  clinic_postcode text,
  clinic_lat double precision,
  clinic_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- health_reminders
-- --------------------------------------------------------------------------
CREATE TABLE public.health_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  reminder_date date NOT NULL,
  reminder_type text,
  completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  recurrence_enabled boolean DEFAULT false,
  recurrence_interval text DEFAULT 'none'::text,
  last_notification_sent_at timestamptz,
  next_notification_at timestamptz
);

-- --------------------------------------------------------------------------
-- vaccinations
-- --------------------------------------------------------------------------
CREATE TABLE public.vaccinations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  vaccine_date date NOT NULL,
  next_due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  recurrence_enabled boolean DEFAULT false,
  recurrence_interval text DEFAULT 'none'::text,
  last_notification_sent_at timestamptz,
  next_notification_at timestamptz
);

-- --------------------------------------------------------------------------
-- legal_consents
-- --------------------------------------------------------------------------
CREATE TABLE public.legal_consents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  version text,
  UNIQUE (user_id, consent_type, version)
);

-- --------------------------------------------------------------------------
-- notifications
-- --------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info'::text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- pet_documents
-- --------------------------------------------------------------------------
CREATE TABLE public.pet_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- pet_invites
-- --------------------------------------------------------------------------
CREATE TABLE public.pet_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'::text,
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + '7 days'::interval),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT pet_invites_status_check CHECK (status = ANY (ARRAY['pending','accepted','revoked','expired'])),
  CONSTRAINT pet_invites_role_check CHECK (role = ANY (ARRAY['family','caregiver']))
);

-- --------------------------------------------------------------------------
-- pet_memberships
-- --------------------------------------------------------------------------
CREATE TABLE public.pet_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (pet_id, user_id),
  CONSTRAINT pet_memberships_role_check CHECK (role = ANY (ARRAY['owner','family','caregiver']))
);

-- --------------------------------------------------------------------------
-- profiles
-- --------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  role text DEFAULT 'user'::text,
  plan_tier text DEFAULT 'free'::text,
  plan_v2 text,
  plan_source text DEFAULT 'stripe'::text,
  plan_notes text,
  plan_expires_at timestamptz,
  plan_updated_at timestamptz DEFAULT now(),
  manual_override boolean DEFAULT false,
  subscription_status text,
  billing_interval text,
  next_billing_at timestamptz,
  trial_end_at timestamptz,
  country_code text,
  timezone text,
  deleted_at timestamptz,
  deletion_scheduled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_plan_tier_check CHECK (plan_tier = ANY (ARRAY['free','premium','family'])),
  CONSTRAINT profiles_plan_v2_check CHECK (plan_v2 = ANY (ARRAY['FREE','PRO','TRIAL'])),
  CONSTRAINT profiles_plan_source_check CHECK (plan_source = ANY (ARRAY['manual','stripe','system'])),
  CONSTRAINT profiles_subscription_status_check CHECK (subscription_status = ANY (ARRAY['active','past_due','canceled','trialing','none']))
);

-- --------------------------------------------------------------------------
-- plan_audit
-- --------------------------------------------------------------------------
CREATE TABLE public.plan_audit (
  id bigint NOT NULL DEFAULT nextval('plan_audit_id_seq'::regclass) PRIMARY KEY,
  actor_id uuid NOT NULL,
  target_id uuid NOT NULL,
  action text NOT NULL,
  new_tier text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT plan_audit_new_tier_check CHECK (new_tier = ANY (ARRAY['free','premium']))
);

-- --------------------------------------------------------------------------
-- reminder_notifications
-- --------------------------------------------------------------------------
CREATE TABLE public.reminder_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_type text NOT NULL,
  reminder_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'::text,
  days_before integer
);

-- --------------------------------------------------------------------------
-- smart_tag_interest
-- --------------------------------------------------------------------------
CREATE TABLE public.smart_tag_interest (
  id bigint NOT NULL DEFAULT nextval('smart_tag_interest_id_seq'::regclass) PRIMARY KEY,
  email text NOT NULL,
  name text,
  likelihood integer NOT NULL,
  features text[],
  comments text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT smart_tag_interest_likelihood_check CHECK (likelihood >= 1 AND likelihood <= 5)
);

-- --------------------------------------------------------------------------
-- storage_usage
-- --------------------------------------------------------------------------
CREATE TABLE public.storage_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_bytes bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- subscription_tiers
-- --------------------------------------------------------------------------
CREATE TABLE public.subscription_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price_monthly numeric NOT NULL,
  price_yearly numeric,
  max_pets integer,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- user_roles
-- --------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- --------------------------------------------------------------------------
-- user_subscriptions
-- --------------------------------------------------------------------------
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier_name text NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active'::text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- weight_records
-- --------------------------------------------------------------------------
CREATE TABLE public.weight_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  weight_kg numeric NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. INDEXES (non-primary-key, non-unique-constraint)
-- ============================================================================

-- device_tokens
CREATE INDEX idx_device_tokens_token ON public.device_tokens USING btree (token);
CREATE INDEX idx_device_tokens_user_id ON public.device_tokens USING btree (user_id);

-- health_reminders
CREATE INDEX idx_health_reminders_completed ON public.health_reminders USING btree (completed, reminder_date) WHERE (completed = false);
CREATE INDEX idx_health_reminders_date ON public.health_reminders USING btree (reminder_date);
CREATE INDEX idx_health_reminders_pet_id ON public.health_reminders USING btree (pet_id);
CREATE INDEX idx_health_reminders_user_id ON public.health_reminders USING btree (user_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read) WHERE (read = false);

-- pet_documents
CREATE INDEX idx_pet_documents_pet_id ON public.pet_documents USING btree (pet_id);
CREATE INDEX idx_pet_documents_user_id ON public.pet_documents USING btree (user_id);

-- pet_invites
CREATE INDEX idx_pet_invites_email ON public.pet_invites USING btree (email);
CREATE INDEX idx_pet_invites_invited_by ON public.pet_invites USING btree (invited_by);
CREATE INDEX idx_pet_invites_status ON public.pet_invites USING btree (status);
CREATE INDEX pet_invites_pet_idx ON public.pet_invites USING btree (pet_id);
CREATE INDEX pet_invites_token_idx ON public.pet_invites USING btree (token);

-- pet_memberships
CREATE INDEX idx_pet_memberships_pet_id ON public.pet_memberships USING btree (pet_id);
CREATE INDEX idx_pet_memberships_user_id ON public.pet_memberships USING btree (user_id);
CREATE INDEX pet_memberships_pet_idx ON public.pet_memberships USING btree (pet_id);
CREATE INDEX pet_memberships_user_idx ON public.pet_memberships USING btree (user_id);

-- pets
CREATE INDEX idx_pets_is_lost ON public.pets USING btree (is_lost) WHERE (is_lost = true);
CREATE INDEX idx_pets_public_id ON public.pets USING btree (public_id);
CREATE UNIQUE INDEX idx_pets_public_token ON public.pets USING btree (public_token);
CREATE INDEX idx_pets_user_id ON public.pets USING btree (user_id);

-- plan_audit
CREATE INDEX plan_audit_target_idx ON public.plan_audit USING btree (target_id);

-- profiles
CREATE INDEX idx_profiles_billing_interval ON public.profiles USING btree (billing_interval);
CREATE INDEX idx_profiles_deletion_scheduled ON public.profiles USING btree (deletion_scheduled, deleted_at) WHERE (deletion_scheduled = true);
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_plan_v2 ON public.profiles USING btree (plan_v2);
CREATE INDEX idx_profiles_subscription_status ON public.profiles USING btree (subscription_status);
CREATE INDEX idx_profiles_trial_end_at ON public.profiles USING btree (trial_end_at) WHERE (trial_end_at IS NOT NULL);

-- reminder_notifications
CREATE INDEX idx_reminder_notifications_lookup ON public.reminder_notifications USING btree (reminder_id, days_before, reminder_type);

-- smart_tag_interest
CREATE INDEX idx_smart_tag_interest_created_at ON public.smart_tag_interest USING btree (created_at DESC);
CREATE INDEX idx_smart_tag_interest_email ON public.smart_tag_interest USING btree (email);

-- storage_usage
CREATE INDEX idx_storage_usage_user_id ON public.storage_usage USING btree (user_id);

-- vaccinations
CREATE INDEX idx_vaccinations_next_due ON public.vaccinations USING btree (next_due_date) WHERE (next_due_date IS NOT NULL);
CREATE INDEX idx_vaccinations_pet_id ON public.vaccinations USING btree (pet_id);
CREATE INDEX idx_vaccinations_user_id ON public.vaccinations USING btree (user_id);

-- weight_records
CREATE INDEX idx_weight_records_pet_id ON public.weight_records USING btree (pet_id);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- has_role (used by RLS policies — must be created first)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- has_pet_access (used by RLS policies)
CREATE OR REPLACE FUNCTION public.has_pet_access(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships WHERE pet_id = _pet_id AND user_id = _user_id
  )
$$;

-- can_edit_pet (used by RLS policies)
CREATE OR REPLACE FUNCTION public.can_edit_pet(_pet_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets WHERE id = _pet_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.pet_memberships 
    WHERE pet_id = _pet_id AND user_id = _user_id AND role = 'family'
  )
$$;

-- has_active_subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
    AND (
      subscription_status IN ('active', 'trialing')
      OR plan_v2 IN ('PRO', 'TRIAL')
      OR plan_tier IN ('premium', 'family', 'pro')
    )
  )
$$;

-- get_user_plan
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(plan_v2, 'FREE')
  FROM public.profiles
  WHERE id = p_user_id;
$$;

-- calculate_user_storage
CREATE OR REPLACE FUNCTION public.calculate_user_storage(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_size BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0)
  INTO total_size
  FROM public.pet_documents
  WHERE user_id = p_user_id;
  
  INSERT INTO public.storage_usage (user_id, total_bytes, updated_at)
  VALUES (p_user_id, total_size, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET total_bytes = total_size, updated_at = NOW();
  
  RETURN total_size;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- set_user_id_from_auth
CREATE OR REPLACE FUNCTION public.set_user_id_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- update_storage_on_document_change
CREATE OR REPLACE FUNCTION public.update_storage_on_document_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_user_storage(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM public.calculate_user_storage(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$;

-- handle_new_user (trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_name TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_name
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- initialize_user_trial
CREATE OR REPLACE FUNCTION public.initialize_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.plan_v2 := NULL;
  NEW.trial_end_at := NULL;
  NEW.subscription_status := 'none';
  RETURN NEW;
END;
$$;

-- check_trial_expired
CREATE OR REPLACE FUNCTION public.check_trial_expired()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plan_v2 = 'TRIAL' 
     AND NEW.trial_end_at < NOW() 
     AND (NEW.subscription_status IS NULL OR NEW.subscription_status = 'trialing') THEN
    NEW.plan_v2 := 'FREE';
    NEW.subscription_status := 'none';
    NEW.trial_end_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- handle_vet_invite_acceptance
CREATE OR REPLACE FUNCTION public.handle_vet_invite_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role = 'vet' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    DECLARE
      v_user_id UUID;
    BEGIN
      SELECT user_id INTO v_user_id
      FROM public.pet_memberships
      WHERE pet_id = NEW.pet_id
      AND user_id IN (SELECT id FROM auth.users WHERE email = NEW.email);
      
      IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'vet'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- get_admin_stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_pets', (SELECT COUNT(*) FROM public.pets),
    'lost_pets', (SELECT COUNT(*) FROM public.pets WHERE is_lost = true),
    'total_vaccinations', 0,
    'premium_users', 0,
    'pets_by_species', (
      SELECT json_object_agg(species, count)
      FROM (SELECT species, COUNT(*) as count FROM public.pets GROUP BY species) species_counts
    ),
    'registrations_this_month', (
      SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', now())
    ),
    'pets_added_this_month', (
      SELECT COUNT(*) FROM public.pets WHERE created_at >= date_trunc('month', now())
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- get_all_users_admin
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, display_name text, plan_tier text, pet_count bigint, roles text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    u.created_at,
    p.display_name,
    p.plan_tier,
    COALESCE(pet_counts.count, 0) as pet_count,
    COALESCE(
      ARRAY_AGG(ur.role::TEXT) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as roles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN (
    SELECT pets.user_id, COUNT(*) as count FROM public.pets GROUP BY pets.user_id
  ) pet_counts ON u.id = pet_counts.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, u.created_at, p.display_name, p.plan_tier, pet_counts.count
  ORDER BY u.created_at DESC;
END;
$$;

-- get_pending_deletions
CREATE OR REPLACE FUNCTION public.get_pending_deletions()
RETURNS TABLE(user_id uuid, email text, display_name text, deleted_at timestamptz, days_remaining integer, hard_delete_date timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.display_name,
    p.deleted_at,
    GREATEST(0, 30 - EXTRACT(DAY FROM (NOW() - p.deleted_at))::integer) as days_remaining,
    (p.deleted_at + INTERVAL '30 days') as hard_delete_date
  FROM public.profiles p
  WHERE p.deletion_scheduled = true
    AND p.deleted_at IS NOT NULL
    AND p.deleted_at > (NOW() - INTERVAL '30 days')
  ORDER BY p.deleted_at ASC;
END;
$$;

-- get_system_activity_stats
CREATE OR REPLACE FUNCTION public.get_system_activity_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'pets_activity', json_build_object(
      'added_today', (SELECT COUNT(*) FROM public.pets WHERE created_at >= CURRENT_DATE),
      'added_this_week', (SELECT COUNT(*) FROM public.pets WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
      'updated_today', (SELECT COUNT(*) FROM public.pets WHERE updated_at >= CURRENT_DATE)
    ),
    'health_activity', json_build_object(
      'reminders_created_today', (SELECT COUNT(*) FROM public.health_reminders WHERE created_at >= CURRENT_DATE),
      'reminders_completed_today', (SELECT COUNT(*) FROM public.health_reminders WHERE updated_at >= CURRENT_DATE AND completed = true),
      'vaccinations_added_today', (SELECT COUNT(*) FROM public.vaccinations WHERE created_at >= CURRENT_DATE)
    ),
    'lost_pets_trend', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT DATE(updated_at) as date, COUNT(*) FILTER (WHERE is_lost = true) as lost_count
        FROM public.pets
        WHERE updated_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(updated_at)
        ORDER BY date DESC
        LIMIT 7
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- get_user_growth_stats
CREATE OR REPLACE FUNCTION public.get_user_growth_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'daily_signups', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM auth.users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ) t
    ),
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_this_week', (SELECT COUNT(DISTINCT user_id) FROM public.pets WHERE updated_at >= NOW() - INTERVAL '7 days'),
    'active_this_month', (SELECT COUNT(DISTINCT user_id) FROM public.pets WHERE updated_at >= NOW() - INTERVAL '30 days')
  ) INTO result;
  RETURN result;
END;
$$;

-- get_database_stats
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'tables', json_build_object(
      'pets', (SELECT COUNT(*) FROM public.pets),
      'profiles', (SELECT COUNT(*) FROM public.profiles),
      'health_reminders', (SELECT COUNT(*) FROM public.health_reminders),
      'vaccinations', (SELECT COUNT(*) FROM public.vaccinations),
      'notifications', (SELECT COUNT(*) FROM public.notifications),
      'pet_documents', (SELECT COUNT(*) FROM public.pet_documents),
      'user_roles', (SELECT COUNT(*) FROM public.user_roles)
    ),
    'storage_stats', json_build_object(
      'total_documents', (SELECT COUNT(*) FROM public.pet_documents),
      'total_size_mb', (
        SELECT COALESCE(SUM(file_size) / 1024.0 / 1024.0, 0)::NUMERIC(10,2)
        FROM public.pet_documents
      )
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Auth trigger (on auth.users — must be created by Supabase or with elevated privileges)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- health_reminders
CREATE TRIGGER update_health_reminders_updated_at
  BEFORE UPDATE ON public.health_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- pet_documents
CREATE TRIGGER update_pet_documents_updated_at
  BEFORE UPDATE ON public.pet_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_storage_on_document_change
  AFTER INSERT OR DELETE OR UPDATE ON public.pet_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_storage_on_document_change();

-- pet_invites
CREATE TRIGGER on_vet_invite_accepted
  AFTER UPDATE ON public.pet_invites
  FOR EACH ROW EXECUTE FUNCTION public.handle_vet_invite_acceptance();

-- pets
CREATE TRIGGER set_pets_user_id_before_insert
  BEFORE INSERT ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_auth();

CREATE TRIGGER set_user_id_on_pets
  BEFORE INSERT ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_auth();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- profiles
CREATE TRIGGER check_trial_expired_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_trial_expired();

CREATE TRIGGER set_trial_on_new_user
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_trial();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- vaccinations
CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_tag_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- device_tokens
CREATE POLICY "Users can view their own device tokens" ON public.device_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own device tokens" ON public.device_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own device tokens" ON public.device_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own device tokens" ON public.device_tokens FOR DELETE USING (auth.uid() = user_id);

-- family_members
CREATE POLICY "Users can view their family connections" ON public.family_members FOR SELECT USING ((auth.uid() = owner_id) OR (auth.uid() = member_user_id));
CREATE POLICY "Users can invite family members" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their family invitations" ON public.family_members FOR UPDATE USING ((auth.uid() = owner_id) OR (auth.uid() = member_user_id));
CREATE POLICY "Users can delete their family connections" ON public.family_members FOR DELETE USING (auth.uid() = owner_id);

-- health_reminders
CREATE POLICY "Users can view reminders for accessible pets" ON public.health_reminders FOR SELECT USING (has_pet_access(pet_id, auth.uid()));
CREATE POLICY "Users can insert reminders for editable pets" ON public.health_reminders FOR INSERT WITH CHECK (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can update reminders for editable pets" ON public.health_reminders FOR UPDATE USING (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can delete reminders for editable pets" ON public.health_reminders FOR DELETE USING (can_edit_pet(pet_id, auth.uid()));

-- legal_consents
CREATE POLICY "Users can view their own consents" ON public.legal_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert consents" ON public.legal_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- pet_documents
CREATE POLICY "Users can view documents for accessible pets" ON public.pet_documents FOR SELECT USING (has_pet_access(pet_id, auth.uid()));
CREATE POLICY "Users can insert documents for editable pets" ON public.pet_documents FOR INSERT WITH CHECK (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can update documents for editable pets" ON public.pet_documents FOR UPDATE USING (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can delete documents for editable pets" ON public.pet_documents FOR DELETE USING (can_edit_pet(pet_id, auth.uid()));

-- pet_invites
CREATE POLICY "Users can view invites for their pets" ON public.pet_invites FOR SELECT USING ((invited_by = auth.uid()) OR (lower(email) = lower((auth.jwt() ->> 'email'::text))));
CREATE POLICY "Pet owners can create invites" ON public.pet_invites FOR INSERT WITH CHECK (invited_by = auth.uid());
CREATE POLICY "Invite creators can update their invites" ON public.pet_invites FOR UPDATE USING (invited_by = auth.uid());
CREATE POLICY "Pet owners can update their invites" ON public.pet_invites FOR UPDATE USING (invited_by = auth.uid());
CREATE POLICY "Invite creators can delete their invites" ON public.pet_invites FOR DELETE USING (invited_by = auth.uid());
CREATE POLICY "Pet owners can delete their invites" ON public.pet_invites FOR DELETE USING (invited_by = auth.uid());

-- pet_memberships
CREATE POLICY "Users can view memberships for their pets" ON public.pet_memberships FOR SELECT USING ((user_id = auth.uid()) OR (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())));
CREATE POLICY "Pet owners can create memberships" ON public.pet_memberships FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM pets WHERE id = pet_memberships.pet_id AND user_id = auth.uid()));
CREATE POLICY "Service role can insert memberships" ON public.pet_memberships FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Pet owners can delete memberships" ON public.pet_memberships FOR DELETE USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

-- pets
CREATE POLICY "Users can view pets they have access to" ON public.pets FOR SELECT USING (has_pet_access(id, auth.uid()));
CREATE POLICY "Admins can view all pets" ON public.pets FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert their own pets" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update pets they can edit" ON public.pets FOR UPDATE USING (can_edit_pet(id, auth.uid()));
CREATE POLICY "Users can delete pets they own" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- plan_audit
CREATE POLICY "Admins can view all audit entries" ON public.plan_audit FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can insert audit entries" ON public.plan_audit FOR INSERT TO service_role WITH CHECK (true);

-- profiles (RESTRICTIVE policy + permissive)
CREATE POLICY "Require authenticated user for profiles" ON public.profiles AS RESTRICTIVE FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = id));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = id)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = id));

-- reminder_notifications
CREATE POLICY "Users can view their notification history" ON public.reminder_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert notifications" ON public.reminder_notifications FOR INSERT TO service_role WITH CHECK (true);

-- smart_tag_interest
CREATE POLICY "Admins can view smart tag interest" ON public.smart_tag_interest FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- storage_usage
CREATE POLICY "Users can view their own storage usage" ON public.storage_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage storage usage" ON public.storage_usage FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text) WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- subscription_tiers
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers FOR SELECT USING (true);

-- user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));
CREATE POLICY "No self-assignment of roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (false);

-- user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view any subscription" ON public.user_subscriptions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id));
CREATE POLICY "Admins can insert subscription for any user" ON public.user_subscriptions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id));
CREATE POLICY "Admins can update any subscription" ON public.user_subscriptions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id));

-- vaccinations
CREATE POLICY "Users can view vaccinations for accessible pets" ON public.vaccinations FOR SELECT USING (has_pet_access(pet_id, auth.uid()));
CREATE POLICY "Users can insert vaccinations for editable pets" ON public.vaccinations FOR INSERT WITH CHECK (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can update vaccinations for editable pets" ON public.vaccinations FOR UPDATE USING (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can delete vaccinations for editable pets" ON public.vaccinations FOR DELETE USING (can_edit_pet(pet_id, auth.uid()));

-- weight_records
CREATE POLICY "Users can view weight records for accessible pets" ON public.weight_records FOR SELECT USING (has_pet_access(pet_id, auth.uid()));
CREATE POLICY "Users can insert weight records for editable pets" ON public.weight_records FOR INSERT WITH CHECK (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can update weight records for editable pets" ON public.weight_records FOR UPDATE USING (can_edit_pet(pet_id, auth.uid()));
CREATE POLICY "Users can delete weight records for editable pets" ON public.weight_records FOR DELETE USING (can_edit_pet(pet_id, auth.uid()));

-- ============================================================================
-- 9. STORAGE BUCKETS & POLICIES
-- ============================================================================
-- REMOVED: Storage bucket creation and RLS policies have been removed from
-- this script due to syntax issues with subquery casts in storage policies.
-- Create the "pet-documents" bucket and its policies manually via the
-- Supabase Dashboard instead.
--
-- Bucket config:
--   Name: pet-documents
--   Public: false
--   File size limit: 50MB (52428800 bytes)
--   Allowed MIME types: application/pdf, image/jpeg, image/jpg, image/png,
--     image/webp, application/msword,
--     application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- ============================================================================
-- 10. AUTH TRIGGER (requires Supabase dashboard or elevated privileges)
-- ============================================================================
-- This trigger must be created on auth.users which is a protected schema.
-- On a fresh Supabase project, run this in the SQL Editor:
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 11. EDGE FUNCTIONS REFERENCE
-- ============================================================================
-- The following Edge Functions are deployed in supabase/functions/:
--
-- accept-invite          — Accept a pet sharing invitation (JWT required)
-- admin-audit-limits     — Audit FREE users against plan limits (admin only)
-- admin-delete-account   — Admin hard/soft delete of user accounts (admin only)
-- admin-set-plan         — Manually set user subscription tier (admin only)
-- check-subscription     — Return user's current subscription/plan status (JWT required)
-- cleanup-deleted-accounts — Cron: hard-delete accounts after 30-day grace period
-- create-pet             — Create a new pet record (JWT required)
-- delete-account         — User self-service soft delete (JWT required)
-- entitlement-check      — Check if user's plan allows a feature (JWT required)
-- export-data            — Export all user data as JSON (JWT required)
-- get-entitlements       — Return user's effective plan/status (JWT required)
-- invite-family          — Send pet sharing invitation email (JWT required)
-- proxy-pet-image        — Proxy signed pet images for public profiles (no JWT)
-- public-pet-contact     — Contact form for found pets (no JWT)
-- restore-account        — Restore a soft-deleted account (JWT required)
-- send-auth-email        — Custom auth email hook (no JWT — called by Supabase)
-- send-contact-email     — Contact form email handler (JWT required)
-- send-reminder-emails   — Cron: send health/vaccination reminder emails
-- send-trial-notifications — Cron: send trial expiry notifications
-- start-trial            — Start a user's free trial
-- submit-smart-tag-interest — Submit smart tag interest form (no JWT)
-- test-reminder-emails   — Dev: test reminder email templates
-- track-consent          — Record legal consent (JWT required)
-- validate-apple-receipt — Validate Apple IAP receipts (JWT required)
--
-- ============================================================================
-- END OF SCHEMA EXPORT
-- ============================================================================
