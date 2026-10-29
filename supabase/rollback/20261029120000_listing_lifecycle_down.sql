-- Rollback for 20261029120000_listing_lifecycle.sql
-- Set VITE_LISTING_LIFECYCLE=false (or unset it) in the frontend before running this.
-- Dropping listing_reports deletes any reports filed since the migration; export them first.

BEGIN;

DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;

DROP TABLE IF EXISTS public.listing_reports;

DROP FUNCTION IF EXISTS public.renew_listing(uuid);

DROP TRIGGER IF EXISTS a_guard_listing_identity ON public.car_listings;
DROP FUNCTION IF EXISTS public.guard_listing_identity();
DROP TRIGGER IF EXISTS b_stamp_listing_availability ON public.car_listings;
DROP FUNCTION IF EXISTS public.stamp_listing_availability();

DROP INDEX IF EXISTS public.idx_car_listings_availability;
ALTER TABLE public.car_listings DROP CONSTRAINT IF EXISTS car_listings_availability_status_check;
ALTER TABLE public.car_listings
  DROP COLUMN IF EXISTS sold_at,
  DROP COLUMN IF EXISTS availability_confirmed_at,
  DROP COLUMN IF EXISTS availability_status;

COMMIT;
