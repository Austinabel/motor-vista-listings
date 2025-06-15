
-- First, let's check what constraints already exist and only add the missing one
-- Add the foreign key for car_listing_images only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'car_listing_images_listing_id_fkey'
        AND table_name = 'car_listing_images'
    ) THEN
        ALTER TABLE public.car_listing_images 
        ADD CONSTRAINT car_listing_images_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES public.car_listings(id) ON DELETE CASCADE;
    END IF;
END $$;
