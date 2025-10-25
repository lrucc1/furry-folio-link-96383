-- Add recurring reminder fields to health_reminders
ALTER TABLE public.health_reminders
ADD COLUMN recurrence_enabled boolean DEFAULT false,
ADD COLUMN recurrence_interval text DEFAULT 'none',
ADD COLUMN last_notification_sent_at timestamp with time zone,
ADD COLUMN next_notification_at timestamp with time zone;

-- Add recurring reminder fields to vaccinations
ALTER TABLE public.vaccinations
ADD COLUMN recurrence_enabled boolean DEFAULT false,
ADD COLUMN recurrence_interval text DEFAULT 'none',
ADD COLUMN last_notification_sent_at timestamp with time zone,
ADD COLUMN next_notification_at timestamp with time zone;

-- Create notification history table
CREATE TABLE public.reminder_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type text NOT NULL,
  reminder_id uuid NOT NULL,
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'sent',
  days_before integer
);

-- Enable RLS on reminder_notifications
ALTER TABLE public.reminder_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification history
CREATE POLICY "Users can view their notification history"
ON public.reminder_notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.reminder_notifications FOR INSERT
WITH CHECK (true);