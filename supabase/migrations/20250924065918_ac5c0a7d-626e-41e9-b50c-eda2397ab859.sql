-- Update the handle_admin_created_content function to not count admin listings against user limits
CREATE OR REPLACE FUNCTION public.handle_admin_created_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve admin-created dealers
  IF TG_TABLE_NAME = 'dealers' AND NEW.admin_created = true THEN
    NEW.status = 'verified';
    NEW.payment_status = 'completed';
  END IF;
  
  -- Auto-approve admin-created car listings and don't count against user limits
  IF TG_TABLE_NAME = 'car_listings' AND NEW.admin_created = true THEN
    NEW.status = 'active';
    -- Admin listings don't affect user quotas, so no counter updates needed
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;