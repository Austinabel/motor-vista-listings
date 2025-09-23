-- Fix admin access to dealers table - ensure admins can see all dealers regardless of status
-- First, let's check if there's an infinite recursion issue with the has_role function

-- Update the admin policy to be more explicit and avoid potential recursion issues
DROP POLICY IF EXISTS "Admins can manage all dealers" ON dealers;

-- Create a more robust admin policy that works with the has_role function
CREATE POLICY "Admins can view and manage all dealers" 
ON dealers 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);

-- Also ensure we have a policy for admins to access user_roles table 
-- This is needed for the admin check above to work properly
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create policies for user_roles table to avoid recursion
CREATE POLICY "Users can view their own roles" 
ON user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur2 
    WHERE ur2.user_id = auth.uid() 
    AND ur2.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur2 
    WHERE ur2.user_id = auth.uid() 
    AND ur2.role = 'admin'::app_role
  )
);

-- Let's also create an admin user for testing if one doesn't exist
-- First, we need to check if there's a user to assign admin role to
-- This will be handled separately to avoid issues