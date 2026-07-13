-- Fix: every brand-new signup failed with "Database error saving new user".
-- handle_new_user pins search_path to 'public' but called digest() from
-- pgcrypto, which is installed in the 'extensions' schema on this project -
-- so the function crashed on the first line of its DECLARE block for every
-- insert into auth.users. Schema-qualify the call and skip trial-history
-- lookup when the provider returns no email (Apple can withhold it on
-- repeat authorizations).
--
-- NOTE: already applied directly to the live database on 2026-07-13; kept
-- here so the repo reflects the deployed definition.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_username text := NULLIF(trim(NEW.raw_user_meta_data->>'username'), '');
  v_email_hash text := CASE WHEN NEW.email IS NULL THEN NULL
                            ELSE encode(extensions.digest(lower(NEW.email), 'sha256'), 'hex') END;
  v_prior_trial timestamptz;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    meta_username
  );

  IF v_email_hash IS NOT NULL THEN
    SELECT first_trial_started_at INTO v_prior_trial
    FROM public.trial_history
    WHERE email_hash = v_email_hash;
  END IF;

  IF v_prior_trial IS NOT NULL THEN
    INSERT INTO public.subscribers (user_id, plan, status, trial_started_at)
    VALUES (NEW.id, 'free', 'inactive', v_prior_trial)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.subscribers (user_id, plan, status)
    VALUES (NEW.id, 'free', 'inactive')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
