-- PilotBank v11.60.0 Cron setup template
-- 1) Replace YOUR_PROJECT_REF and YOUR_PUBLISHABLE_KEY below.
-- 2) Run after deploying both Edge Functions and setting function secrets.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists supabase_vault with schema vault;

-- Replace placeholders before running:
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co','pilotbank_project_url');
select vault.create_secret('YOUR_PUBLISHABLE_KEY','pilotbank_publishable_key');
select vault.create_secret('YOUR_CRON_SECRET','pilotbank_cron_secret');

select cron.unschedule(jobid) from cron.job where jobname in ('pilotbank-push-worker-hourly','pilotbank-weekly-ranking-hourly');

-- Hourly inactivity check + announcement retry.
select cron.schedule('pilotbank-push-worker-hourly','5 * * * *',$$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='pilotbank_project_url') || '/functions/v1/pilotbank-push-worker',
    headers := jsonb_build_object('Content-Type','application/json','apikey',(select decrypted_secret from vault.decrypted_secrets where name='pilotbank_publishable_key'),'x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='pilotbank_cron_secret')),
    body := '{"mode":"cron"}'::jsonb,
    timeout_milliseconds := 10000
  );
$$);

-- Hourly ranking maintenance. At Monday 00:10 KST (Sunday 15:10 UTC) it creates the new weekly round; it also finalizes timed-out attempts.
select cron.schedule('pilotbank-weekly-ranking-hourly','10 * * * *',$$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='pilotbank_project_url') || '/functions/v1/pilotbank-weekly-ranking',
    headers := jsonb_build_object('Content-Type','application/json','apikey',(select decrypted_secret from vault.decrypted_secrets where name='pilotbank_publishable_key'),'x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='pilotbank_cron_secret')),
    body := '{"mode":"maintenance"}'::jsonb,
    timeout_milliseconds := 10000
  );
$$);
