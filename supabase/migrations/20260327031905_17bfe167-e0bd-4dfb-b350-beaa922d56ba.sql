
CREATE TABLE public.ubi_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_content text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up', 'down')),
  conversation_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ubi_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert ratings" ON public.ubi_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings" ON public.ubi_ratings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.ubi_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.ubi_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
