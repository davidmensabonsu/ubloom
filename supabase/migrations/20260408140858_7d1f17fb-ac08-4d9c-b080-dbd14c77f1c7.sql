
CREATE POLICY "Admins can view all user data"
  ON public.user_data FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
