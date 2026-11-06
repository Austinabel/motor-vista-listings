-- Reverses 20261110120000_argus.sql.
-- Deletes the spending history in argus_usage and the cap in argus_settings: note them first if needed.

BEGIN;

CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio', 'wavechat', 'conscience') $$;

UPDATE public.platform_features SET mode = 'preview' WHERE feature = 'argus' AND mode = 'motorcars';

DROP FUNCTION IF EXISTS public.get_argus_budget();
DROP FUNCTION IF EXISTS public.argus_record_usage(uuid, text, text, integer, integer, numeric, text);
DROP FUNCTION IF EXISTS public.argus_gate(uuid);
DROP FUNCTION IF EXISTS public.argus_month_start();
DROP TABLE IF EXISTS public.argus_usage;
DROP TABLE IF EXISTS public.argus_settings;
DROP FUNCTION IF EXISTS public.stamp_argus_settings();

COMMIT;
