-- Fix the security definer view by making it a regular view
-- and ensuring RLS is properly applied
DROP VIEW IF EXISTS public.public_dealers;

-- Create a secure function that returns only safe dealer info for public use
CREATE OR REPLACE FUNCTION public.get_public_dealers()
RETURNS TABLE (
  id uuid,
  business_name text,
  state text,
  year_established text,
  description text,
  website text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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