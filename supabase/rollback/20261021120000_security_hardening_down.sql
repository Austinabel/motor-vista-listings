-- Rollback for 20261021120000_security_hardening.sql
-- Run only if the hardening migration breaks a legitimate workflow, and redeploy the frontend
-- versions of DealerProfile.tsx, VerifiedDealers.tsx, SellYourCar.tsx and services/sellers.ts
-- from before the migration in the same step.
--
-- Deliberately NOT reverted, because nothing in the app depends on them and reverting would
-- reopen critical holes:
--   * REVOKE EXECUTE on assign_admin_role and create_notification
--   * the dealer_documents storage policies (admins and the owning dealer only)

BEGIN;

-- Guard triggers and their functions
DROP TRIGGER IF EXISTS a_guard_car_listing_fields ON public.car_listings;
DROP TRIGGER IF EXISTS count_free_listing ON public.car_listings;
DROP TRIGGER IF EXISTS a_guard_dealer_fields ON public.dealers;
DROP TRIGGER IF EXISTS z_guard_profile_fields ON public.profiles;
DROP FUNCTION IF EXISTS public.guard_car_listing_fields();
DROP FUNCTION IF EXISTS public.count_free_listing();
DROP FUNCTION IF EXISTS public.guard_dealer_fields();
DROP FUNCTION IF EXISTS public.guard_profile_fields();
DROP FUNCTION IF EXISTS public.is_restricted_api_caller();

-- Public dealer functions added by the migration
DROP FUNCTION IF EXISTS public.get_public_dealer(uuid);
DROP FUNCTION IF EXISTS public.get_public_dealer_by_seller(uuid);

-- get_public_dealers back to its previous seven columns
DROP FUNCTION IF EXISTS public.get_public_dealers();
CREATE FUNCTION public.get_public_dealers()
RETURNS TABLE(
  id uuid,
  business_name text,
  state text,
  year_established text,
  description text,
  website text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.business_name, d.state, d.year_established, d.description, d.website, d.created_at
  FROM public.dealers d
  WHERE d.status = 'verified';
$$;
GRANT EXECUTE ON FUNCTION public.get_public_dealers() TO anon, authenticated;

-- Previous public read policy on dealers (exposes every column of verified dealers)
DROP POLICY IF EXISTS "Public can view verified dealer info" ON public.dealers;
CREATE POLICY "Public can view verified dealer info"
ON public.dealers
FOR SELECT
TO anon, authenticated
USING (status = 'verified');

COMMIT;
