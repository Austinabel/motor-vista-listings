
-- Drop the existing admin policy that's causing the issue
DROP POLICY IF EXISTS "Admins can update any listing" ON public.car_listings;

-- Create a new admin policy that uses the profiles table instead
-- First, let's ensure we can identify admins through the profiles table
CREATE POLICY "Admins can update any listing" 
  ON public.car_listings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  ));

-- Also add a policy for admins to view all listings
CREATE POLICY "Admins can view all listings" 
  ON public.car_listings 
  FOR SELECT 
  USING (
    status = 'approved' 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );
