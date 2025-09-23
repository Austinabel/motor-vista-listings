-- Fix critical security issue: Restrict public access to dealers table
-- Only allow basic business information to be publicly visible

-- First, update the public dealers function to only return safe fields
CREATE OR REPLACE FUNCTION public.get_public_dealers()
RETURNS TABLE(
  id uuid, 
  business_name text, 
  state text, 
  year_established text, 
  description text, 
  website text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    d.id,
    d.business_name,
    d.state,
    d.year_established,
    d.description,
    d.website,
    d.created_at
  FROM public.dealers d
  WHERE d.status = 'verified';
$$;

-- Update the public RLS policy to be more restrictive
-- Remove the overly permissive policy that exposes all fields
DROP POLICY IF EXISTS "Public can view basic verified dealer info" ON dealers;

-- Create a new restrictive policy that only allows access to basic business info
-- This policy will work with the security definer function above
CREATE POLICY "Public can view verified dealer basic info" 
ON dealers 
FOR SELECT 
TO public
USING (false); -- Block direct table access, force use of security definer function

-- Ensure admins can still access full dealer information
-- Update admin policy to be more explicit
DROP POLICY IF EXISTS "Admins can manage all dealers" ON dealers;

CREATE POLICY "Admins can manage all dealers" 
ON dealers 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure dealers can still manage their own profiles  
-- This policy should remain as is but let's make it more explicit
DROP POLICY IF EXISTS "Dealers can manage their own profile" ON dealers;

CREATE POLICY "Dealers can manage their own profile" 
ON dealers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);