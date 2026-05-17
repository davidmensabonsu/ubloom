CREATE POLICY "Temp anon upload routine icons migration"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'routine-icons');

CREATE POLICY "Temp anon update routine icons migration"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'routine-icons')
WITH CHECK (bucket_id = 'routine-icons');