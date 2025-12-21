-- Require cron secret header for reminder emails
SELECT cron.unschedule('send-daily-reminder-emails');

SELECT cron.schedule(
  'send-daily-reminder-emails',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://yyuvupjbvjpbouxuzdye.supabase.co/functions/v1/send-reminder-emails',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Cron-Secret', current_setting('app.settings.cron_secret', true)
        ),
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
