-- Add featured listing management columns to car_listings table
ALTER TABLE public.car_listings 
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN is_top_listing BOOLEAN DEFAULT false,
ADD COLUMN is_boosted BOOLEAN DEFAULT false,
ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN boosted_until TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN boost_approved_by UUID NULL,
ADD COLUMN boost_approved_at TIMESTAMP WITH TIME ZONE NULL;

-- Add featured column to dealers table
ALTER TABLE public.dealers 
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE NULL;

-- Create function to automatically expire featured/boosted listings
CREATE OR REPLACE FUNCTION public.expire_featured_listings()
RETURNS VOID AS $$
BEGIN
  -- Expire featured car listings
  UPDATE public.car_listings 
  SET is_featured = false, featured_until = NULL
  WHERE is_featured = true 
    AND featured_until IS NOT NULL 
    AND featured_until <= NOW();
  
  -- Expire boosted car listings
  UPDATE public.car_listings 
  SET is_boosted = false, boosted_until = NULL
  WHERE is_boosted = true 
    AND boosted_until IS NOT NULL 
    AND boosted_until <= NOW();
  
  -- Expire featured dealers
  UPDATE public.dealers 
  SET is_featured = false, featured_until = NULL
  WHERE is_featured = true 
    AND featured_until IS NOT NULL 
    AND featured_until <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create RLS policies for featured listing management
CREATE POLICY "Admins can manage featured car listings" 
ON public.car_listings 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage featured dealers" 
ON public.dealers 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());