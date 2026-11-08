-- Read-only check of the live database before the Motorcars migrations.
-- Changes nothing. Run it in the Supabase SQL Editor and copy the single result cell back.

SELECT jsonb_pretty(jsonb_build_object(
  'postgres_version', current_setting('server_version'),

  'tables_present_already', (
    SELECT coalesce(jsonb_agg(table_name ORDER BY table_name), '[]'::jsonb)
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('platform_features', 'inventory_events', 'sale_receipts', 'listing_reports',
                         'conversations', 'messages', 'conscience_cycles', 'conscience_findings',
                         'argus_settings', 'argus_usage')
  ),

  'functions_needed', (
    SELECT jsonb_object_agg(f, EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = f))
    FROM unnest(ARRAY['is_admin', 'has_role', 'create_notification', 'can_create_free_listing',
                      'get_public_dealers', 'assign_admin_role', 'update_updated_at_column']) AS f
  ),

  'triggers', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname, 'trigger', t.tgname, 'function', p.proname) ORDER BY c.relname, t.tgname), '[]'::jsonb)
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
  ),

  'policies', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', schemaname || '.' || tablename, 'policy', policyname, 'command', cmd,
      'permissive', permissive, 'roles', roles) ORDER BY schemaname, tablename, policyname), '[]'::jsonb)
    FROM pg_policies
    WHERE schemaname = 'public'
       OR (schemaname = 'storage' AND tablename = 'objects')
  ),

  'storage_buckets', (
    SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'public', public) ORDER BY id), '[]'::jsonb)
    FROM storage.buckets
  ),

  'pg_cron_available', EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'),

  'row_counts', jsonb_build_object(
    'car_listings', (SELECT count(*) FROM public.car_listings),
    'dealers', (SELECT count(*) FROM public.dealers),
    'profiles', (SELECT count(*) FROM public.profiles)
  )
)) AS precheck;
