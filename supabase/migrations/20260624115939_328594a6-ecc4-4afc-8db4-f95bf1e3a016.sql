
CREATE OR REPLACE FUNCTION public.rotate_widget_token()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_token text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

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
