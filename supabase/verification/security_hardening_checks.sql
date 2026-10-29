-- Read-only checks that the security-hardening migration is in effect.
-- Run in the Supabase SQL editor after applying it. SELECT statements only; no customer data.
-- Every row in the result should show ok = true.

WITH checks AS (
  -- 1. Privilege-granting and notification functions are not executable over the API
  SELECT 'anon cannot execute ' || p.proname AS check_name,
         NOT has_function_privilege('anon', p.oid, 'EXECUTE') AS ok
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname IN ('assign_admin_role', 'create_notification')
  UNION ALL
  SELECT 'authenticated cannot execute ' || p.proname,
         NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname IN ('assign_admin_role', 'create_notification')

  -- 2. No public SELECT policy left on dealers
  UNION ALL
  SELECT 'dealers has no anon-readable policy',
         NOT EXISTS (
           SELECT 1 FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'dealers' AND cmd IN ('SELECT', 'ALL')
             AND ('anon' = ANY (roles) OR 'public' = ANY (roles))
         )

  -- 3. The old "any signed-in user can read ID cards" policy is gone
  UNION ALL
  SELECT 'old dealer ID card policy removed',
         NOT EXISTS (
           SELECT 1 FROM pg_policies
           WHERE schemaname = 'storage' AND tablename = 'objects'
             AND policyname = 'Allow admins to view dealer ID cards'
         )
  UNION ALL
  SELECT 'dealer document policies present',
         (SELECT count(*) FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects'
            AND policyname IN ('Admins can view dealer documents', 'Dealers can view their own documents')) = 2

  -- 4. Guard triggers installed
  UNION ALL
  SELECT 'trigger ' || t.name || ' present',
         EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = t.name AND NOT tgisinternal)
  FROM (VALUES ('a_guard_car_listing_fields'), ('count_free_listing'), ('a_guard_dealer_fields'), ('z_guard_profile_fields')) AS t(name)

  -- 5. Public dealer functions exist and are executable by anon
  UNION ALL
  SELECT 'anon can execute ' || p.proname,
         has_function_privilege('anon', p.oid, 'EXECUTE')
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname IN ('get_public_dealers', 'get_public_dealer', 'get_public_dealer_by_seller')

  -- 6. Row-level security still on for the protected tables
  UNION ALL
  SELECT 'RLS enabled on ' || c.relname, c.relrowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname IN ('dealers', 'car_listings', 'profiles', 'user_roles')
)
SELECT check_name, ok FROM checks ORDER BY ok, check_name;
