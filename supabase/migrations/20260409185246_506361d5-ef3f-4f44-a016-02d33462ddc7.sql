-- Drop existing write policies that apply to 'public' role
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Recreate with authenticated role
CREATE POLICY "Authenticated users can upload vision images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vision-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can update vision images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vision-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can delete vision images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vision-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );