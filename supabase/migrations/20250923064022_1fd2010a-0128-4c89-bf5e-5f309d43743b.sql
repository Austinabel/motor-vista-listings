-- Fix infinite recursion in user_roles RLS policies
-- The issue is that the admin policy references user_roles table within itself

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create a proper security definer function to check admin status
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'admin'::app_role
  );
$$;

-- Now create non-recursive policies using the security definer function
CREATE POLICY "Users can view their own roles" 
ON user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- For admin management, use the security definer function
CREATE POLICY "Admins can manage all roles" 
ON user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also update the dealers policies to use the new security definer function
DROP POLICY IF EXISTS "Admins can view and manage all dealers" ON dealers;

CREATE POLICY "Admins can view and manage all dealers" 
ON dealers 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());