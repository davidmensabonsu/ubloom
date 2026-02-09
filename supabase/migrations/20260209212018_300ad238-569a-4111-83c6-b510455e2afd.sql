
-- Create storage bucket for vision images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vision-images', 'vision-images', true);

-- Allow authenticated users to upload their own vision images
CREATE POLICY "Users can upload their own vision images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vision-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view vision images (public bucket)
CREATE POLICY "Vision images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vision-images');

-- Allow users to update their own vision images
CREATE POLICY "Users can update their own vision images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vision-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own vision images
CREATE POLICY "Users can delete their own vision images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vision-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
