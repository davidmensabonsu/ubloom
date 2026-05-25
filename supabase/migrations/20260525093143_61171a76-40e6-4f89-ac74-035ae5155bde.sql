
-- 1. routine-icons: enforce folder ownership on writes
DROP POLICY IF EXISTS "Authenticated can upload routine icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update routine icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete routine icons" ON storage.objects;

CREATE POLICY "Users can upload own routine icons"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'routine-icons' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own routine icons"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'routine-icons' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own routine icons"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'routine-icons' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 2. vision-images: drop duplicate public-role policies
DROP POLICY IF EXISTS "Users can upload their own vision images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vision images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vision images" ON storage.objects;

-- 3. ubi_memory: add UPDATE policy
CREATE POLICY "Users can update own memories"
ON public.ubi_memory FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Remove subscribers from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.subscribers;

-- 5. Lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
