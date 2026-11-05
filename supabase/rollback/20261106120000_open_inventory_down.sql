-- Reverses 20261106120000_open_inventory.sql.
-- Deletes the whole inventory history and every VIN entered: export inventory_events and
-- car_listings.vin first if they hold anything worth keeping.

BEGIN;

CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid') $$;

UPDATE public.platform_features SET mode = 'preview' WHERE feature = 'oio' AND mode = 'motorcars';

DROP FUNCTION IF EXISTS public.get_stand_inventory(uuid);
DROP FUNCTION IF EXISTS public.get_listing_history(uuid);
ALTER TABLE public.profiles DROP COLUMN IF EXISTS show_price_history;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS show_sales_count;
DROP TRIGGER IF EXISTS z_record_inventory_events ON public.car_listings;
DROP FUNCTION IF EXISTS public.record_inventory_events();
DROP TRIGGER IF EXISTS a_guard_listing_vin ON public.car_listings;
DROP FUNCTION IF EXISTS public.guard_listing_vin();
DROP INDEX IF EXISTS public.car_listings_one_live_listing_per_vin;
ALTER TABLE public.car_listings DROP CONSTRAINT IF EXISTS car_listings_vin_format;
ALTER TABLE public.car_listings DROP COLUMN IF EXISTS vin;
DROP TRIGGER IF EXISTS keep_inventory_events ON public.inventory_events;
DROP FUNCTION IF EXISTS public.keep_inventory_events();
DROP TABLE IF EXISTS public.inventory_events;

COMMIT;
