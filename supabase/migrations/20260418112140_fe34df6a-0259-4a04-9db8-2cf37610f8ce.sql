CREATE TABLE public.ubi_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'goal', 'struggle', 'breakthrough', 'preference', 
    'pattern', 'never_forget', 'life_context', 'relationship'
  )),
  content TEXT NOT NULL,
  source_conversation_id UUID REFERENCES public.ubi_conversations(id) ON DELETE SET NULL,
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_referenced_at TIMESTAMPTZ
);

CREATE INDEX idx_ubi_memory_user_id ON public.ubi_memory(user_id);
CREATE INDEX idx_ubi_memory_type ON public.ubi_memory(memory_type);
CREATE INDEX idx_ubi_memory_importance ON public.ubi_memory(importance DESC);

ALTER TABLE public.ubi_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories" ON public.ubi_memory
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON public.ubi_memory
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON public.ubi_memory
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memories" ON public.ubi_memory
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ubi_memory_updated_at
  BEFORE UPDATE ON public.ubi_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();