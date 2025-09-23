-- Fix the public dealers policy to actually allow access to verified dealers
DROP POLICY IF EXISTS "Public can view verified dealer basic info" ON public.dealers;

CREATE POLICY "Public can view verified dealer info" 
ON public.dealers 
FOR SELECT 
TO anon, authenticated
USING (status = 'verified');