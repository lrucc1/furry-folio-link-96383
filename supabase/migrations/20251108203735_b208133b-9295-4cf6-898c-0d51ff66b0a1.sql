-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule reminder emails to run daily at 9:00 AM
SELECT cron.schedule(
  'send-daily-reminder-emails',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://pnlsootdnywbkqnxsqya.supabase.co/functions/v1/send-reminder-emails',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Cron-Secret', current_setting('app.settings.cron_secret', true)
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);
