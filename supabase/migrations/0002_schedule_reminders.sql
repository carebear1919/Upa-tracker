-- Schedules the daily reminder sweep (supabase/functions/check-due-dates)
-- via pg_cron + pg_net. Run this AFTER deploying the function
-- (`supabase functions deploy check-due-dates`) and setting its secrets.
--
-- Replace the two placeholders below before running:
--   <project-ref>   — from your project URL: https://<project-ref>.supabase.co
--   <cron-secret>   — any random string; set the SAME value as the
--                      CRON_SECRET secret on the function
--     supabase secrets set CRON_SECRET=<cron-secret>

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'renta-daily-reminders',
  '0 8 * * *', -- 08:00 UTC daily — adjust to your timezone if needed
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/check-due-dates',
    headers := jsonb_build_object('x-cron-secret', '<cron-secret>')
  );
  $$
);

-- To check it's registered: select * from cron.job;
-- To unschedule: select cron.unschedule('renta-daily-reminders');
