-- Open Inventory (OIO), interim Motorcars version.
-- Requires, in order: 20261021120000_security_hardening.sql, 20261029120000_listing_lifecycle.sql,
-- 20261105120000_platform_features_and_mid.sql.
--
-- Every change to a car becomes a permanent event in inventory_events (Moatwave PRD Section 11:
-- state is historical, never destructive). The events are written by a trigger on car_listings,
-- so they record what actually happened to the row, not what any screen claims.
-- * Events are never updated or deleted, and survive the listing being deleted.
-- * Existing listings get one backfilled "listed" event (and "sold" where sold_at is set), marked
--   backfilled, because their earlier history was never recorded.
-- * Adds an optional VIN per car: one live listing per VIN, locked once set.
-- * Awards MID points for confirming availability (once per car per day) and for marking a car sold.
-- * Adds profiles.show_price_history and profiles.show_sales_count: each seller chooses whether buyers see
--   price changes and how many cars they have sold through Motorcars (both off by default).
-- Reverse with supabase/rollback/20261106120000_open_inventory_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. The event history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_events (
  id bigserial PRIMARY KEY,
  -- Not a foreign key on purpose: history outlives a deleted listing
  listing_id uuid NOT NULL,
  seller_id uuid,
  event_type text NOT NULL CHECK (event_type IN (
    'submitted', 'listed', 'price_changed', 'availability_confirmed', 'reserved', 'made_available',
    'sold', 'withdrawn', 'renewed', 'vin_added'
  )),
  from_value jsonb,
  to_value jsonb,
  -- Snapshot so the event still reads correctly if the listing changes or is deleted
  car_title text NOT NULL,
  actor_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  -- true for events reconstructed when this migration ran, not recorded as they happened
  backfilled boolean NOT NULL DEFAULT false,
  -- Set once the event has been sent to Moatwave's Open Inventory
  synced_to_moatwave_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_inventory_events_listing ON public.inventory_events (listing_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_events_seller ON public.inventory_events (seller_id, occurred_at DESC);

ALTER TABLE public.inventory_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sellers read their own inventory events" ON public.inventory_events;
CREATE POLICY "Sellers read their own inventory events" ON public.inventory_events
  FOR SELECT USING (auth.uid() = seller_id OR public.is_admin());
-- No insert/update/delete policies: only the trigger below writes events.

CREATE OR REPLACE FUNCTION public.keep_inventory_events()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- The only permitted change is marking an event as sent to Moatwave
  IF TG_OP = 'UPDATE'
     AND NEW.synced_to_moatwave_at IS DISTINCT FROM OLD.synced_to_moatwave_at
     AND (to_jsonb(NEW) - 'synced_to_moatwave_at') = (to_jsonb(OLD) - 'synced_to_moatwave_at') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Inventory history cannot be changed or deleted';
END;
$$;

DROP TRIGGER IF EXISTS keep_inventory_events ON public.inventory_events;
CREATE TRIGGER keep_inventory_events
  BEFORE UPDATE OR DELETE ON public.inventory_events
  FOR EACH ROW EXECUTE FUNCTION public.keep_inventory_events();

-- ---------------------------------------------------------------------------
-- 2. VIN
-- ---------------------------------------------------------------------------
ALTER TABLE public.car_listings ADD COLUMN IF NOT EXISTS vin text;
ALTER TABLE public.car_listings DROP CONSTRAINT IF EXISTS car_listings_vin_format;
ALTER TABLE public.car_listings
  ADD CONSTRAINT car_listings_vin_format CHECK (vin IS NULL OR vin ~ '^[A-HJ-NPR-Z0-9]{17}$');

-- The same car can't be live twice
CREATE UNIQUE INDEX IF NOT EXISTS car_listings_one_live_listing_per_vin
  ON public.car_listings (vin)
  WHERE vin IS NOT NULL
    AND status IN ('active', 'pending_review', 'pending_payment')
    AND availability_status IN ('available', 'reserved');

CREATE OR REPLACE FUNCTION public.guard_listing_vin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.vin := nullif(upper(regexp_replace(coalesce(NEW.vin, ''), '\s', '', 'g')), '');
  IF TG_OP = 'UPDATE' AND OLD.vin IS NOT NULL AND NEW.vin IS DISTINCT FROM OLD.vin
     AND public.is_restricted_api_caller() THEN
    RAISE EXCEPTION 'The VIN cannot be changed once added. Contact support if it is wrong.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_guard_listing_vin ON public.car_listings;
CREATE TRIGGER a_guard_listing_vin
  BEFORE INSERT OR UPDATE ON public.car_listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_vin();

-- ---------------------------------------------------------------------------
-- 3. Recording events
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_inventory_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  title text := concat_ws(' ', NEW.year, NEW.make, NEW.model);
  actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, to_value, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, CASE WHEN NEW.status = 'active' THEN 'listed' ELSE 'submitted' END,
            jsonb_build_object('price', NEW.price), title, actor);
    RETURN NEW;
  END IF;

  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, to_value, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, 'listed', jsonb_build_object('price', NEW.price), title, actor);
  END IF;

  IF NEW.price IS DISTINCT FROM OLD.price THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, from_value, to_value, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, 'price_changed', jsonb_build_object('price', OLD.price),
            jsonb_build_object('price', NEW.price), title, actor);
  END IF;

  IF NEW.availability_status IS DISTINCT FROM OLD.availability_status THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, from_value, to_value, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id,
            CASE NEW.availability_status
              WHEN 'reserved' THEN 'reserved'
              WHEN 'sold' THEN 'sold'
              WHEN 'unavailable' THEN 'withdrawn'
              ELSE 'made_available'
            END,
            jsonb_build_object('availability', OLD.availability_status),
            jsonb_build_object('availability', NEW.availability_status), title, actor);

    IF NEW.availability_status = 'sold' AND NEW.user_id IS NOT NULL THEN
      PERFORM public.award_mid_points(NEW.user_id, 'sale_recorded', 'sale_recorded:' || NEW.id, 'car_listings:' || NEW.id);
    ELSIF NEW.availability_status = 'available' AND NEW.user_id IS NOT NULL THEN
      PERFORM public.award_mid_points(NEW.user_id, 'availability_confirmed',
        'availability_confirmed:' || NEW.id || ':' || current_date, 'car_listings:' || NEW.id);
    END IF;
  ELSIF NEW.availability_confirmed_at IS DISTINCT FROM OLD.availability_confirmed_at
        AND NEW.availability_confirmed_at IS NOT NULL THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, 'availability_confirmed', title, actor);
    IF NEW.user_id IS NOT NULL THEN
      PERFORM public.award_mid_points(NEW.user_id, 'availability_confirmed',
        'availability_confirmed:' || NEW.id || ':' || current_date, 'car_listings:' || NEW.id);
    END IF;
  END IF;

  IF NEW.expires_at IS NOT NULL AND (OLD.expires_at IS NULL OR NEW.expires_at > OLD.expires_at)
     AND OLD.status = 'active' THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, from_value, to_value, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, 'renewed', jsonb_build_object('expires_at', OLD.expires_at),
            jsonb_build_object('expires_at', NEW.expires_at), title, actor);
  END IF;

  IF NEW.vin IS NOT NULL AND OLD.vin IS NULL THEN
    INSERT INTO public.inventory_events (listing_id, seller_id, event_type, car_title, actor_id)
    VALUES (NEW.id, NEW.user_id, 'vin_added', title, actor);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS z_record_inventory_events ON public.car_listings;
CREATE TRIGGER z_record_inventory_events
  AFTER INSERT OR UPDATE ON public.car_listings
  FOR EACH ROW EXECUTE FUNCTION public.record_inventory_events();

-- ---------------------------------------------------------------------------
-- 4. Backfill: what can be known about existing listings
-- ---------------------------------------------------------------------------
INSERT INTO public.inventory_events (listing_id, seller_id, event_type, to_value, car_title, occurred_at, backfilled)
SELECT l.id, l.user_id, 'listed', jsonb_build_object('price', l.price), concat_ws(' ', l.year, l.make, l.model), l.created_at, true
FROM public.car_listings l
WHERE l.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM public.inventory_events e WHERE e.listing_id = l.id);

INSERT INTO public.inventory_events (listing_id, seller_id, event_type, to_value, car_title, occurred_at, backfilled)
SELECT l.id, l.user_id, 'sold', jsonb_build_object('availability', 'sold'), concat_ws(' ', l.year, l.make, l.model), l.sold_at, true
FROM public.car_listings l
WHERE l.sold_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.inventory_events e WHERE e.listing_id = l.id AND e.event_type = 'sold');

-- ---------------------------------------------------------------------------
-- 5. Reading
-- ---------------------------------------------------------------------------
-- Each seller decides whether buyers see their cars' price history and their sales count. Off by default.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_price_history boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_sales_count boolean NOT NULL DEFAULT false;

-- A car's public history: shown for live listings (and to their owner and admins).
-- Who acted is never exposed; submissions and VIN entries are left out. Unless the seller
-- chose to show price history, buyers see no price changes and no recorded prices at all.
-- prices_public tells the owner's screen what buyers can see.
CREATE OR REPLACE FUNCTION public.get_listing_history(_listing_id uuid)
RETURNS TABLE (event_type text, occurred_at timestamptz, from_value jsonb, to_value jsonb, backfilled boolean, prices_public boolean)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH listing AS (
    SELECT l.status,
           (l.user_id = auth.uid() OR public.is_admin()) AS full_view,
           coalesce(p.show_price_history, false) AS prices_public
    FROM public.car_listings l
    LEFT JOIN public.profiles p ON p.id = l.user_id
    WHERE l.id = _listing_id
  )
  SELECT e.event_type, e.occurred_at,
         CASE WHEN v.full_view OR v.prices_public THEN e.from_value ELSE e.from_value - 'price' END,
         CASE WHEN v.full_view OR v.prices_public THEN e.to_value ELSE e.to_value - 'price' END,
         e.backfilled, v.prices_public
  FROM public.inventory_events e, listing v
  WHERE e.listing_id = _listing_id
    AND public.feature_mode('oio') = 'motorcars'
    AND (v.status = 'active' OR v.full_view)
    AND e.event_type NOT IN ('submitted', 'vin_added')
    AND (v.full_view OR v.prices_public OR e.event_type <> 'price_changed')
  ORDER BY e.occurred_at DESC, e.id DESC
  LIMIT 100
$$;
GRANT EXECUTE ON FUNCTION public.get_listing_history(uuid) TO anon, authenticated;

-- A stand's live stock at a glance, worked out from listings and events. The sold count is
-- returned only to the seller, admins, or anyone when the seller chose to show it.
CREATE OR REPLACE FUNCTION public.get_stand_inventory(_seller_id uuid)
RETURNS TABLE (available integer, reserved integer, sold_recorded integer, last_activity_at timestamptz)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*)::int FROM public.car_listings
      WHERE user_id = _seller_id AND status = 'active' AND availability_status = 'available'),
    (SELECT count(*)::int FROM public.car_listings
      WHERE user_id = _seller_id AND status = 'active' AND availability_status = 'reserved'),
    CASE WHEN _seller_id = auth.uid() OR public.is_admin()
              OR coalesce((SELECT show_sales_count FROM public.profiles WHERE id = _seller_id), false)
         THEN (SELECT count(DISTINCT listing_id)::int FROM public.inventory_events
                WHERE seller_id = _seller_id AND event_type = 'sold')
    END,
    (SELECT max(occurred_at) FROM public.inventory_events
      WHERE seller_id = _seller_id AND event_type <> 'submitted' AND NOT backfilled)
  WHERE public.feature_mode('oio') = 'motorcars'
$$;
GRANT EXECUTE ON FUNCTION public.get_stand_inventory(uuid) TO anon, authenticated;

-- The Motorcars version of Open Inventory now exists, so admins may switch it on
CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio') $$;

COMMIT;
