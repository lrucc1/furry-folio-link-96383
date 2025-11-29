-- Performance indexes for high-frequency queries

-- pets table (most critical)
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_public_id ON public.pets(public_id);
CREATE INDEX IF NOT EXISTS idx_pets_is_lost ON public.pets(is_lost) WHERE is_lost = true;

-- health_reminders table
CREATE INDEX IF NOT EXISTS idx_health_reminders_user_id ON public.health_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_health_reminders_pet_id ON public.health_reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_reminders_date ON public.health_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_health_reminders_completed ON public.health_reminders(completed, reminder_date) WHERE completed = false;

-- vaccinations table
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON public.vaccinations(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON public.vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due ON public.vaccinations(next_due_date);

-- pet_documents table
CREATE INDEX IF NOT EXISTS idx_pet_documents_user_id ON public.pet_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_documents_pet_id ON public.pet_documents(pet_id);

-- notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read) WHERE read = false;

-- pet_invites table
CREATE INDEX IF NOT EXISTS idx_pet_invites_email ON public.pet_invites(email);
CREATE INDEX IF NOT EXISTS idx_pet_invites_invited_by ON public.pet_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_pet_invites_status ON public.pet_invites(status);

-- pet_memberships table
CREATE INDEX IF NOT EXISTS idx_pet_memberships_pet_id ON public.pet_memberships(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_memberships_user_id ON public.pet_memberships(user_id);

-- reminder_notifications table
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_lookup ON public.reminder_notifications(reminder_id, days_before, reminder_type);

-- storage_usage table
CREATE INDEX IF NOT EXISTS idx_storage_usage_user_id ON public.storage_usage(user_id);

-- stripe_webhook_events table
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON public.stripe_webhook_events(event_id);

-- profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_v2 ON public.profiles(plan_v2);