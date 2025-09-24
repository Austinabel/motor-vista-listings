-- Add free_listings_used column to dealers table to track used free listings
ALTER TABLE public.dealers
ADD COLUMN free_listings_used INTEGER NOT NULL DEFAULT 0;

-- Add admin_created column to dealers table to track admin-created dealers
ALTER TABLE public.dealers
ADD COLUMN admin_created BOOLEAN NOT NULL DEFAULT false;

-- Add admin_created column to car_listings table to track admin-created listings
ALTER TABLE public.car_listings
ADD COLUMN admin_created BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to allow admins to create dealers and listings directly

-- Add policy for admins to create dealers without restrictions
CREATE POLICY "Admins can create dealers directly"
ON public.dealers
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() AND admin_created = true
);

-- Add policy for admins to create car listings without restrictions  
CREATE POLICY "Admins can create car listings directly"
ON public.car_listings
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() AND admin_created = true
);

-- Create function to auto-approve admin-created content
CREATE OR REPLACE FUNCTION public.handle_admin_created_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-approve admin-created dealers
  IF TG_TABLE_NAME = 'dealers' AND NEW.admin_created = true THEN
    NEW.status = 'verified';
    NEW.payment_status = 'completed';
  END IF;
  
  -- Auto-approve admin-created car listings  
  IF TG_TABLE_NAME = 'car_listings' AND NEW.admin_created = true THEN
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add triggers for auto-approval
CREATE TRIGGER auto_approve_admin_dealers
  BEFORE INSERT ON public.dealers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_created_content();

CREATE TRIGGER auto_approve_admin_listings
  BEFORE INSERT ON public.car_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_created_content();