
CREATE TABLE public.widget_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  last_used_at timestamptz
);

CREATE UNIQUE INDEX widget_tokens_user_id_key ON public.widget_tokens(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_tokens TO authenticated;
GRANT ALL ON public.widget_tokens TO service_role;

ALTER TABLE public.widget_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own widget token - select"
  ON public.widget_tokens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own widget token - insert"
  ON public.widget_tokens FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own widget token - update"
  ON public.widget_tokens FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own widget token - delete"
  ON public.widget_tokens FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.rotate_widget_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_token text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- url-safe base64: replace +/ with -_ and strip =
  new_token := translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');

  INSERT INTO public.widget_tokens (token, user_id, expires_at, last_used_at)
  VALUES (new_token, uid, now() + interval '30 days', NULL)
  ON CONFLICT (user_id) DO UPDATE
    SET token = EXCLUDED.token,
        expires_at = EXCLUDED.expires_at,
        created_at = now(),
        last_used_at = NULL;

  RETURN new_token;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_widget_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_widget_token() TO authenticated;
