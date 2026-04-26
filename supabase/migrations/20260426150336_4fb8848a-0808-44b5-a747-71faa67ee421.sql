ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
ALTER TABLE public.subscribers REPLICA IDENTITY FULL;