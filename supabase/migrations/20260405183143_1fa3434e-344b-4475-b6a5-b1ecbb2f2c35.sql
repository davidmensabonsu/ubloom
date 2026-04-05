
-- 1. Make vision-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'vision-images';

-- 2. Replace the broad SELECT policy with an owner-scoped one
DROP POLICY IF EXISTS "Vision images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can view their own vision images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'vision-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 3. Block UPDATE on user_roles to prevent privilege escalation
CREATE POLICY "Nobody can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (false);
