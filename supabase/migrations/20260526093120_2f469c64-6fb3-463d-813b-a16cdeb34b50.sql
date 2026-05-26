
-- 1. Add server-managed trial start column
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz NOT NULL DEFAULT now();

-- 2. Backfill from user_data JSONB where present (keeps existing trials honest)
UPDATE public.subscribers s
SET trial_started_at = COALESCE(
  (ud.data->>'trialStartedAt')::timestamptz,
  s.trial_started_at
)
FROM public.user_data ud
WHERE ud.user_id = s.user_id
  AND ud.data ? 'trialStartedAt'
  AND (ud.data->>'trialStartedAt') <> '';

-- 3. Ensure every existing auth user has a subscribers row so trial is enforced server-side
INSERT INTO public.subscribers (user_id, plan, status, trial_started_at)
SELECT u.id, 'free', 'inactive',
       COALESCE(
         (ud.data->>'trialStartedAt')::timestamptz,
         u.created_at,
         now()
       )
FROM auth.users u
LEFT JOIN public.user_data ud ON ud.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- 4. Extend new-user trigger to also seed a subscribers row (trial_started_at via default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_username text := NULLIF(trim(NEW.raw_user_meta_data->>'username'), '');
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    meta_username
  );

  INSERT INTO public.subscribers (user_id, plan, status)
  VALUES (NEW.id, 'free', 'inactive')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 5. Make sure the trigger is actually attached to auth.users (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Block any attempt to modify trial_started_at (defence in depth; no user UPDATE policy exists, but service role and future policies could)
CREATE OR REPLACE FUNCTION public.protect_trial_started_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at THEN
    NEW.trial_started_at := OLD.trial_started_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscribers_protect_trial_started_at ON public.subscribers;
CREATE TRIGGER subscribers_protect_trial_started_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.protect_trial_started_at();
