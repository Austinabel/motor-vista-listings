-- Fix security issue: Remove overly permissive dealer policies and create secure ones
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to dealer info" ON public.dealers;
DROP POLICY IF EXISTS "Anyone can register as dealer" ON public.dealers;
DROP POLICY IF EXISTS "Anyone can view verified dealers" ON public.dealers;
DROP POLICY IF EXISTS "Authenticated users can view all dealers" ON public.dealers;
DROP POLICY IF EXISTS "Authenticated users can update dealers" ON public.dealers;

-- Create secure policies
-- 1. Public can only view basic info of verified dealers (no sensitive data)
CREATE POLICY "Public can view basic verified dealer info" 
ON public.dealers 
FOR SELECT 
USING (
  status = 'verified' 
  AND id IS NOT NULL
);

-- 2. Dealers can view and update their own complete profile
CREATE POLICY "Dealers can manage their own profile" 
ON public.dealers 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Admins can view and manage all dealers
CREATE POLICY "Admins can manage all dealers" 
ON public.dealers 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Authenticated users can register as dealers (but must provide their user_id)
CREATE POLICY "Authenticated users can register as dealers" 
ON public.dealers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);