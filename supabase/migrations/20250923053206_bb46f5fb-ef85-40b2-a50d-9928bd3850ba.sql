-- Clean up and fix dealer RLS policies properly
-- Drop all existing policies
DROP POLICY IF EXISTS "Dealers can insert their own info" ON public.dealers;
DROP POLICY IF EXISTS "Dealers can update their own info" ON public.dealers;

-- The secure policies are mostly correct, but let's create a view for public dealer info
-- to ensure only safe fields are exposed to the public
CREATE OR REPLACE VIEW public.public_dealers AS
SELECT 
  id,
  business_name,
  state,
  year_established,
  description,
  website,
  created_at
FROM public.dealers 
WHERE status = 'verified';