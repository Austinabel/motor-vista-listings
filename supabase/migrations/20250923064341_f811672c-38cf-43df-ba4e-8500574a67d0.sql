-- Fix car listings visibility - public should only see active/approved cars
-- Only admins should see unapproved cars

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view all active listings" ON car_listings;

-- Create separate policies for different access levels

-- 1. Public (unauthenticated) users can only see active listings
CREATE POLICY "Public can view active listings" 
ON car_listings 
FOR SELECT 
TO anon
USING (status = 'active');

-- 2. Authenticated users can see active listings + their own listings (any status)
CREATE POLICY "Users can view active listings and own listings" 
ON car_listings 
FOR SELECT 
TO authenticated
USING (
  status = 'active' 
  OR auth.uid() = user_id
);

-- 3. Admins can see all listings regardless of status
CREATE POLICY "Admins can view all listings" 
ON car_listings 
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Keep the existing admin update policy
-- (Admins can update any listing policy should already exist)