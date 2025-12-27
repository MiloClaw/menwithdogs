-- Admin read access policies for User Management visibility

-- 1. Admin can read all member profiles
CREATE POLICY "Admins can read all member profiles"
ON public.member_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Admin can read all user roles
CREATE POLICY "Admins can read all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin can read all couples
CREATE POLICY "Admins can read all couples"
ON public.couples
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));