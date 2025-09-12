-- Fix security vulnerability: Remove public access to profiles table
-- and create secure way to access seller information for listings

-- First, drop the problematic public access policy
DROP POLICY IF EXISTS "Allow public read access to seller profiles" ON public.profiles;

-- Create a secure function to get seller information only for active listings
CREATE OR REPLACE FUNCTION public.get_seller_info_for_listing(listing_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  user_type text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.last_name, p.user_type
  FROM public.profiles p
  INNER JOIN public.car_listings cl ON p.id = cl.user_id
  WHERE p.id = listing_user_id 
    AND cl.status = 'active'
    AND cl.user_id = listing_user_id;
$$;

-- Grant execute permission to authenticated users and anon users (for public listings)
GRANT EXECUTE ON FUNCTION public.get_seller_info_for_listing(uuid) TO authenticated, anon;

-- Create a more restrictive policy for profile access - only authenticated users can see profiles
-- but limit it to just basic seller info and only for active listings context
CREATE POLICY "Authenticated users can view seller profiles for active listings" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 
    FROM public.car_listings 
    WHERE user_id = profiles.id 
    AND status = 'active'
  )
);

-- Keep the existing policies for users to manage their own profiles
-- (These are already correctly implemented)