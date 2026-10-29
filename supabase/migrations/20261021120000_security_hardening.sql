-- Security hardening
-- 1. Lock down SECURITY DEFINER functions that must not be callable over the API
-- 2. Restrict dealer ID card downloads to admins and the owning dealer
-- 3. Stop exposing private dealer columns (ID numbers, tax ID, payment refs) publicly
-- 4. Prevent non-admins from self-approving / self-featuring listings and dealers
-- 5. Enforce and count free-listing quotas server-side
--
-- Applies atomically and can be re-run: every object it creates is dropped first if present.
-- Reverse with supabase/rollback/20261021120000_security_hardening_down.sql.
-- No table, column or row is dropped or modified.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Function privileges
-- ---------------------------------------------------------------------------
-- assign_admin_role lets the caller grant admin to any email, and create_notification
-- writes a notification to any user. Postgres grants EXECUTE to PUBLIC by default, so both
-- were callable by anon through supabase.rpc(). Revoked for every overload by name, so a
-- signature that differs in the live database cannot abort the migration.
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('assign_admin_role', 'create_notification')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Dealer documents bucket
-- ---------------------------------------------------------------------------
-- The previous SELECT policy let any signed-in user read every dealer's ID card.
DROP POLICY IF EXISTS "Allow admins to view dealer ID cards" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can view their own documents" ON storage.objects;

CREATE POLICY "Admins can view dealer documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'dealer_documents' AND public.is_admin());

CREATE POLICY "Dealers can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dealer_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- 3. Public dealer data via functions only
-- ---------------------------------------------------------------------------
-- This policy exposed every column of verified dealers (id_card_number,
-- tax_id, cac_number, payment_reference, id_card_path, ...) to anon.
-- Dealers still read their own row and admins read all rows through existing policies.
DROP POLICY IF EXISTS "Public can view verified dealer info" ON public.dealers;

-- Adds image_url and is_featured; existing columns keep their order for current callers.
DROP FUNCTION IF EXISTS public.get_public_dealers();
CREATE FUNCTION public.get_public_dealers()
RETURNS TABLE(
  id uuid,
  business_name text,
  state text,
  year_established text,
  description text,
  website text,
  created_at timestamp with time zone,
  image_url text,
  is_featured boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.business_name, d.state, d.year_established, d.description,
         d.website, d.created_at, d.image_url, d.is_featured
  FROM public.dealers d
  WHERE d.status = 'verified';
$$;

-- One approved dealer's public profile: business contact details only, no identity documents.
DROP FUNCTION IF EXISTS public.get_public_dealer(uuid);
CREATE FUNCTION public.get_public_dealer(dealer_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  business_name text,
  state text,
  address text,
  phone text,
  year_established text,
  description text,
  website text,
  image_url text,
  is_featured boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.user_id, d.business_name, d.state, d.address, d.phone,
         d.year_established, d.description, d.website, d.image_url,
         d.is_featured, d.created_at
  FROM public.dealers d
  WHERE d.id = $1 AND d.status = 'verified';
$$;

-- The approved dealer behind a listing, looked up by the listing's seller.
-- car_listings.user_id is already public on every listing, so this reveals no new identifier.
DROP FUNCTION IF EXISTS public.get_public_dealer_by_seller(uuid);
CREATE FUNCTION public.get_public_dealer_by_seller(seller_id uuid)
RETURNS TABLE(
  id uuid,
  business_name text,
  state text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.business_name, d.state
  FROM public.dealers d
  WHERE d.user_id = $1 AND d.status = 'verified'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_dealers() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_dealer(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_dealer_by_seller(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4 & 5. Guard privileged columns
-- ---------------------------------------------------------------------------
-- Guards only apply to direct API requests (current_user is anon/authenticated).
-- SECURITY DEFINER functions such as expire_featured_listings run as the owner
-- and are unaffected, as are the service role and admins.
CREATE OR REPLACE FUNCTION public.is_restricted_api_caller()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT current_user IN ('anon', 'authenticated') AND NOT public.is_admin();
$$;

-- car_listings ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_car_listing_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_restricted_api_caller() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('pending_review', 'pending_payment') THEN
      RAISE EXCEPTION 'New listings must start as pending_review or pending_payment';
    END IF;
    IF NEW.listing_plan = 'free' AND NOT public.can_create_free_listing(NEW.user_id) THEN
      RAISE EXCEPTION 'Free listing limit reached';
    END IF;
    NEW.admin_created := false;
    NEW.is_featured := false;
    NEW.is_boosted := false;
    NEW.is_top_listing := false;
    NEW.featured_until := NULL;
    NEW.boosted_until := NULL;
    NEW.boost_approved_by := NULL;
    NEW.boost_approved_at := NULL;
    RETURN NEW;
  END IF;

  -- UPDATE: the only status change a seller may make is submitting payment
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (OLD.status = 'pending_payment' AND NEW.status = 'pending_review') THEN
    RAISE EXCEPTION 'Listing status can only be changed by an admin';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.admin_created IS DISTINCT FROM OLD.admin_created
     OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.is_boosted IS DISTINCT FROM OLD.is_boosted
     OR NEW.is_top_listing IS DISTINCT FROM OLD.is_top_listing
     OR NEW.featured_until IS DISTINCT FROM OLD.featured_until
     OR NEW.boosted_until IS DISTINCT FROM OLD.boosted_until
     OR NEW.boost_approved_by IS DISTINCT FROM OLD.boost_approved_by
     OR NEW.boost_approved_at IS DISTINCT FROM OLD.boost_approved_at
     OR NEW.listing_plan IS DISTINCT FROM OLD.listing_plan
     OR NEW.listing_price IS DISTINCT FROM OLD.listing_price
     OR NEW.listing_duration IS DISTINCT FROM OLD.listing_duration
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'These listing fields can only be changed by an admin';
  END IF;

  RETURN NEW;
END;
$$;

-- Named so it fires before auto_approve_admin_listings (triggers fire alphabetically)
DROP TRIGGER IF EXISTS a_guard_car_listing_fields ON public.car_listings;
CREATE TRIGGER a_guard_car_listing_fields
  BEFORE INSERT OR UPDATE ON public.car_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_car_listing_fields();

-- Count free listings server-side (previously done by the client, which could skip it)
CREATE OR REPLACE FUNCTION public.count_free_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.admin_created OR NEW.listing_plan IS DISTINCT FROM 'free' THEN
    RETURN NEW;
  END IF;

  UPDATE public.dealers
  SET free_listings_used = free_listings_used + 1, updated_at = now()
  WHERE user_id = NEW.user_id AND status = 'verified';

  IF NOT FOUND THEN
    UPDATE public.profiles
    SET monthly_listings_used = COALESCE(monthly_listings_used, 0) + 1, updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS count_free_listing ON public.car_listings;
CREATE TRIGGER count_free_listing
  AFTER INSERT ON public.car_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.count_free_listing();

-- dealers --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_dealer_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_restricted_api_caller() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.payment_status := 'pending';
    NEW.admin_created := false;
    NEW.is_featured := false;
    NEW.featured_until := NULL;
    NEW.free_listings_used := 0;
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.admin_created IS DISTINCT FROM OLD.admin_created
     OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.featured_until IS DISTINCT FROM OLD.featured_until
     OR NEW.free_listings_used IS DISTINCT FROM OLD.free_listings_used THEN
    RAISE EXCEPTION 'These dealer fields can only be changed by an admin';
  END IF;

  RETURN NEW;
END;
$$;

-- Named so it fires before auto_approve_admin_dealers
DROP TRIGGER IF EXISTS a_guard_dealer_fields ON public.dealers;
CREATE TRIGGER a_guard_dealer_fields
  BEFORE INSERT OR UPDATE ON public.dealers
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_dealer_fields();

-- profiles -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_restricted_api_caller() THEN
    RETURN NEW;
  END IF;

  -- check_monthly_listings_reset (fires earlier) may legitimately reset these
  -- once the reset date has passed; otherwise users may not touch them.
  IF OLD.monthly_listings_reset_date > now() THEN
    NEW.monthly_listings_used := OLD.monthly_listings_used;
    NEW.monthly_listings_reset_date := OLD.monthly_listings_reset_date;
  END IF;

  RETURN NEW;
END;
$$;

-- Named so it fires after check_monthly_listings_reset
DROP TRIGGER IF EXISTS z_guard_profile_fields ON public.profiles;
CREATE TRIGGER z_guard_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_fields();

COMMIT;
