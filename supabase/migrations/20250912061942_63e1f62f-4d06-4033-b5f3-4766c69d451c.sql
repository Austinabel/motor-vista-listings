-- Fix RLS policies for admin access to car listings and images

-- Ensure RLS is enabled on car_listings (in case it was disabled)
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;

-- Add admin access policy for car_listing_images
DROP POLICY IF EXISTS "Admins can view all listing images" ON public.car_listing_images;
CREATE POLICY "Admins can view all listing images" 
ON public.car_listing_images 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin management policy for car_listing_images
DROP POLICY IF EXISTS "Admins can manage all listing images" ON public.car_listing_images;
CREATE POLICY "Admins can manage all listing images" 
ON public.car_listing_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin policies for car_listings are properly ordered (most permissive first)
DROP POLICY IF EXISTS "Admins can view all listings" ON public.car_listings;
CREATE POLICY "Admins can view all listings" 
ON public.car_listings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update any listing" ON public.car_listings;
CREATE POLICY "Admins can update any listing" 
ON public.car_listings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));