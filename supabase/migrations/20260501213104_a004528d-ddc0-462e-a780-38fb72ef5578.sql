INSERT INTO storage.buckets (id, name, public) VALUES ('video-journals', 'video-journals', false) ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload to their own folder
CREATE POLICY "Users can upload their own video journals"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'video-journals' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can read their own video journals
CREATE POLICY "Users can read their own video journals"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'video-journals' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can delete their own video journals
CREATE POLICY "Users can delete their own video journals"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'video-journals' AND (storage.foldername(name))[1] = auth.uid()::text);