-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to send reminder emails daily at 9 AM UTC
SELECT cron.schedule(
  'send-daily-reminder-emails',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://pnlsootdnywbkqnxsqya.supabase.co/functions/v1/send-reminder-emails',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Cron-Secret', current_setting('app.settings.cron_secret', true)
        ),
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
