
-- 1. Trial history table — keyed by sha256(lower(email)) so the raw email is never stored
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.trial_history (
  email_hash text PRIMARY KEY,
  first_trial_started_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only service_role touches this table; no anon/authenticated grants.
GRANT ALL ON public.trial_history TO service_role;

ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon/authenticated. service_role bypasses RLS.

-- 2. Update handle_new_user to honour prior trial history
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_username text := NULLIF(trim(NEW.raw_user_meta_data->>'username'), '');
  v_email_hash text := encode(digest(lower(NEW.email), 'sha256'), 'hex');
  v_prior_trial timestamptz;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    meta_username
  );

  SELECT first_trial_started_at INTO v_prior_trial
  FROM public.trial_history
  WHERE email_hash = v_email_hash;

  -- If this email already consumed a trial, seed the new subscribers row with
  -- the original (already-expired) start date. Otherwise let the column default
  -- (now()) grant a fresh 3-day trial.
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
