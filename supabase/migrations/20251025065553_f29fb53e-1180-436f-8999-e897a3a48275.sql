-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to send reminder emails daily at 9 AM UTC
SELECT cron.schedule(
  'send-daily-reminder-emails',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://yyuvupjbvjpbouxuzdye.supabase.co/functions/v1/send-reminder-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dXZ1cGpidmpwYm91eHV6ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTg0MDEsImV4cCI6MjA3NTIzNDQwMX0.Q5DdI1MOkVTxMa5tMbPtE97kNCnxjKm3AEr7wep98xg"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);