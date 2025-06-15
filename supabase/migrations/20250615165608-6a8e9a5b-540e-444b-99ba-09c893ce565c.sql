
BEGIN;

-- Drop dependent RLS policies before altering the status column
DROP POLICY IF EXISTS "Users can view all approved listings" ON public.car_listings;
DROP POLICY IF EXISTS "Users can view images for accessible listings" ON public.car_listing_images;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.car_listings;

-- Drop the old check constraint
ALTER TABLE public.car_listings DROP CONSTRAINT IF EXISTS car_listings_status_check;

-- Update existing status values to the new standardized format
UPDATE public.car_listings SET status = 'pending_review' WHERE status = 'pending';
UPDATE public.car_listings SET status = 'active' WHERE status = 'approved';

-- Add the new, more comprehensive check constraint for status
ALTER TABLE public.car_listings ADD CONSTRAINT car_listings_status_check
CHECK (status IN ('pending_payment', 'pending_review', 'active', 'rejected', 'sold', 'expired'));

-- Re-create the RLS policies with the new 'active' status
CREATE POLICY "Users can view all active listings"
  ON public.car_listings
  FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can view images for accessible listings"
  ON public.car_listing_images
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.car_listings
    WHERE id = listing_id
    AND (status = 'active' OR user_id = auth.uid())
  ));

-- Re-create admin policy to view all listings regardless of status
CREATE POLICY "Admins can view all listings"
  ON public.car_listings
  FOR SELECT
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin');

-- Add the payment_reference column for tracking manual payments
ALTER TABLE public.car_listings ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Set the default status for new listings
ALTER TABLE public.car_listings ALTER COLUMN status SET DEFAULT 'pending_review';

COMMIT;
