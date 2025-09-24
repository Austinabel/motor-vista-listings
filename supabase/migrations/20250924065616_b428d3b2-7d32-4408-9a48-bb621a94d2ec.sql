-- Add monthly listing tracking for regular users
ALTER TABLE public.profiles 
ADD COLUMN monthly_listings_used INTEGER DEFAULT 0,
ADD COLUMN monthly_listings_reset_date TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now()) + interval '1 month';

-- Create function to reset monthly listings count
CREATE OR REPLACE FUNCTION public.reset_monthly_listings()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset monthly listings if we're in a new month
  IF NEW.monthly_listings_reset_date <= now() THEN
    NEW.monthly_listings_used = 0;
    NEW.monthly_listings_reset_date = date_trunc('month', now()) + interval '1 month';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically reset monthly listings
CREATE TRIGGER check_monthly_listings_reset
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_monthly_listings();

-- Function to check if user can create free listing
CREATE OR REPLACE FUNCTION public.can_create_free_listing(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
  dealer_record RECORD;
BEGIN
  -- Check if user is a dealer
  SELECT * INTO dealer_record 
  FROM public.dealers 
  WHERE dealers.user_id = $1 AND status = 'verified';
  
  -- If dealer, check dealer limits (20 free listings total)
  IF FOUND THEN
    RETURN dealer_record.free_listings_used < 20;
  END IF;
  
  -- If regular user, check monthly limit (5 per month)
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE id = $1;
  
  IF FOUND THEN
    -- Reset counter if we're in a new month
    IF profile_record.monthly_listings_reset_date <= now() THEN
      UPDATE public.profiles 
      SET monthly_listings_used = 0,
          monthly_listings_reset_date = date_trunc('month', now()) + interval '1 month'
      WHERE id = $1;
      RETURN TRUE; -- Can create listing since counter was reset
    END IF;
    
    RETURN profile_record.monthly_listings_used < 5;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;