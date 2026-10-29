-- Listing lifecycle: seller-managed availability, renewal, listing reports, readable settings.
-- Requires 20261021120000_security_hardening.sql (is_restricted_api_caller, guard triggers).
--
-- Adds columns and one table; no existing row is deleted. Existing listings get
-- availability_status = 'available' and no confirmation date, so they show as
-- "availability not confirmed" until their seller confirms. Expiry is NOT enforced here:
-- every active listing in production is already past expires_at.
-- Reverse with supabase/rollback/20261029120000_listing_lifecycle_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Availability, separate from moderation status
-- ---------------------------------------------------------------------------
-- status stays the moderation state (pending_review, active, rejected, ...).
-- availability_status is the seller's claim about the car itself.
ALTER TABLE public.car_listings
  ADD COLUMN IF NOT EXISTS availability_status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS availability_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz;

ALTER TABLE public.car_listings DROP CONSTRAINT IF EXISTS car_listings_availability_status_check;
ALTER TABLE public.car_listings
  ADD CONSTRAINT car_listings_availability_status_check
  CHECK (availability_status IN ('available', 'reserved', 'sold', 'unavailable'));

CREATE INDEX IF NOT EXISTS idx_car_listings_availability ON public.car_listings (status, availability_status);

-- Sellers change availability directly (existing "update own listing" policy). This trigger
-- keeps the timestamps honest: a seller cannot backdate or forward-date a confirmation.
CREATE OR REPLACE FUNCTION public.stamp_listing_availability()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.availability_confirmed_at := now();
    NEW.sold_at := NULL;
    NEW.availability_status := 'available';
    RETURN NEW;
  END IF;

  IF public.is_restricted_api_caller() THEN
    -- Any confirmation the seller sends is recorded as "now"
    IF NEW.availability_confirmed_at IS DISTINCT FROM OLD.availability_confirmed_at THEN
      NEW.availability_confirmed_at := now();
    END IF;
  END IF;

  IF NEW.availability_status IS DISTINCT FROM OLD.availability_status THEN
    NEW.availability_confirmed_at := now();
    NEW.sold_at := CASE WHEN NEW.availability_status = 'sold' THEN now() ELSE NULL END;
  ELSIF NEW.sold_at IS DISTINCT FROM OLD.sold_at THEN
    NEW.sold_at := OLD.sold_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS b_stamp_listing_availability ON public.car_listings;
CREATE TRIGGER b_stamp_listing_availability
  BEFORE INSERT OR UPDATE ON public.car_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_listing_availability();

-- Make, model and year identify the car that was approved; sellers may not change them
-- afterwards (they would turn an approved listing into a different car).
CREATE OR REPLACE FUNCTION public.guard_listing_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_restricted_api_caller()
     AND (NEW.make IS DISTINCT FROM OLD.make
          OR NEW.model IS DISTINCT FROM OLD.model
          OR NEW.year IS DISTINCT FROM OLD.year) THEN
    RAISE EXCEPTION 'Make, model and year cannot be changed after listing';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_guard_listing_identity ON public.car_listings;
CREATE TRIGGER a_guard_listing_identity
  BEFORE UPDATE ON public.car_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_listing_identity();

-- ---------------------------------------------------------------------------
-- 2. Renewal
-- ---------------------------------------------------------------------------
-- expires_at is admin-only under the hardening guard, so renewal goes through this function:
-- the owner extends their own listing by its plan duration and confirms availability.
CREATE OR REPLACE FUNCTION public.renew_listing(listing_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_expiry timestamptz;
BEGIN
  UPDATE public.car_listings
  SET expires_at = now() + make_interval(days => COALESCE(listing_duration, 30)),
      availability_confirmed_at = now()
  WHERE id = listing_id
    AND user_id = auth.uid()
    AND status = 'active'
    AND availability_status IN ('available', 'reserved')
  RETURNING expires_at INTO new_expiry;

  IF new_expiry IS NULL THEN
    RAISE EXCEPTION 'Listing not found, not yours, or not active';
  END IF;
  RETURN new_expiry;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.renew_listing(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.renew_listing(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Listing reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.car_listings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL DEFAULT auth.uid(),
  reason text NOT NULL CHECK (reason IN ('sold_or_unavailable', 'wrong_details', 'suspected_scam', 'duplicate', 'offensive', 'other')),
  details text CHECK (char_length(details) <= 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing ON public.listing_reports (listing_id);
-- One open report per person per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_reports_one_open
  ON public.listing_reports (listing_id, reporter_id) WHERE status = 'open';

ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signed-in users can report listings" ON public.listing_reports;
CREATE POLICY "Signed-in users can report listings"
ON public.listing_reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid() AND status = 'open' AND resolved_at IS NULL AND resolved_by IS NULL AND admin_notes IS NULL);

DROP POLICY IF EXISTS "Reporters can view their own reports" ON public.listing_reports;
CREATE POLICY "Reporters can view their own reports"
ON public.listing_reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage reports" ON public.listing_reports;
CREATE POLICY "Admins can manage reports"
ON public.listing_reports FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Settings readable by everyone
-- ---------------------------------------------------------------------------
-- The sell page reads listing_plans_enabled, but only admins could read app_settings, so
-- sellers always saw the default. Settings hold no secrets; writes stay admin-only.
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings"
ON public.app_settings FOR SELECT
TO anon, authenticated
USING (true);

COMMIT;
