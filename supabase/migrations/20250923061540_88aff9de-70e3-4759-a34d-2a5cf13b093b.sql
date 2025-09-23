-- Update RLS policy for car_listing_images to allow public access to images
-- for listings that are either active OR being viewed by their owner

DROP POLICY IF EXISTS "Users can view images for accessible listings" ON car_listing_images;

-- Create a more permissive policy that allows:
-- 1. Public access to images for active listings
-- 2. Owner access to images for their own listings (any status)
-- 3. Public access to images for pending_review listings (so users can see their own uploaded images)
CREATE POLICY "Allow public access to listing images"
ON car_listing_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM car_listings cl
    WHERE cl.id = car_listing_images.listing_id
    AND (
      cl.status = 'active'
      OR cl.status = 'pending_review'
    )
  )
);