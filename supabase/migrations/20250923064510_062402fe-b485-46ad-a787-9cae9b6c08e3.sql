-- Fix car listings visibility - public should only see active/approved cars
-- Drop all existing SELECT policies for car_listings first

DROP POLICY IF EXISTS "Admins can view all listings" ON car_listings;
DROP POLICY IF EXISTS "Users can view all active listings" ON car_listings;

-- Create new properly scoped policies

-- 1. Public (unauthenticated) users can only see active listings
CREATE POLICY "Public can view active listings" 
ON car_listings 
FOR SELECT 
TO anon
USING (status = 'active');

-- 2. Authenticated users can see active listings + their own listings (any status)
CREATE POLICY "Users can view active and own listings" 
ON car_listings 
FOR SELECT 
TO authenticated
USING (
  status = 'active' 
  OR auth.uid() = user_id
);

-- 3. Admins can see all listings regardless of status
CREATE POLICY "Admins can view all car listings" 
ON car_listings 
FOR SELECT 
TO authenticated
USING (public.is_admin());