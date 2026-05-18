
-- 1. Add username column (nullable so existing accounts aren't broken)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- 2. Case-insensitive uniqueness + lookup index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (lower(username));

-- 3. Format validation trigger
CREATE OR REPLACE FUNCTION public.validate_profile_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.username !~ '^[A-Za-z0-9._]{3,30}$' THEN
    RAISE EXCEPTION 'Invalid username format' USING ERRCODE = '22023';
  END IF;
  IF NEW.username LIKE '.%' OR NEW.username LIKE '%.' THEN
    RAISE EXCEPTION 'Username cannot start or end with a period' USING ERRCODE = '22023';
  END IF;
  IF position('..' in NEW.username) > 0 THEN
    RAISE EXCEPTION 'Username cannot contain consecutive periods' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_username_trg ON public.profiles;
CREATE TRIGGER validate_profile_username_trg
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_username();

-- 4. Public availability check RPC
CREATE OR REPLACE FUNCTION public.username_available(_username text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned text := lower(trim(_username));
BEGIN
  IF cleaned IS NULL OR cleaned = '' THEN RETURN false; END IF;
  IF cleaned !~ '^[a-z0-9._]{3,30}$' THEN RETURN false; END IF;
  IF cleaned LIKE '.%' OR cleaned LIKE '%.' THEN RETURN false; END IF;
  IF position('..' in cleaned) > 0 THEN RETURN false; END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = cleaned
  );
END;
$$;

REVOKE ALL ON FUNCTION public.username_available(text) FROM public;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;

-- 5. Update handle_new_user to capture username from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_username text := NULLIF(trim(NEW.raw_user_meta_data->>'username'), '');
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    meta_username
  );
  RETURN NEW;
END;
$$;
