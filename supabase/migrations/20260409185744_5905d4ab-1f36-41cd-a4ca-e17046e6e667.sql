-- Add CHECK constraint to restrict role values
ALTER TABLE public.ubi_messages
  ADD CONSTRAINT ubi_messages_role_check
  CHECK (role IN ('user', 'assistant', 'system'));

-- Drop existing INSERT policy and recreate with role restriction
DROP POLICY IF EXISTS "Users can insert own messages" ON public.ubi_messages;
CREATE POLICY "Users can insert own messages"
  ON public.ubi_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'user');

-- Drop existing UPDATE policy and recreate with role restriction
DROP POLICY IF EXISTS "Users can update own messages" ON public.ubi_messages;
CREATE POLICY "Users can update own messages"
  ON public.ubi_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND role = 'user');