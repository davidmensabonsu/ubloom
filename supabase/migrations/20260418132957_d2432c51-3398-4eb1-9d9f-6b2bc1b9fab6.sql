-- Create private bucket for voice journal recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-journals', 'voice-journals', false)
ON CONFLICT (id) DO NOTHING;

-- Users can read their own voice journal files (path: {user_id}/...)
CREATE POLICY "Users can view their own voice journals"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-journals'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own voice journals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-journals'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own voice journals
CREATE POLICY "Users can delete their own voice journals"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-journals'
  AND auth.uid()::text = (storage.foldername(name))[1]
);