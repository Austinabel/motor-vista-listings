-- Reverses 20261109120000_conscience.sql.
-- Deletes every cycle and finding, including sealed ones: export conscience_cycles and
-- conscience_findings first if they hold anything worth keeping. Points already in
-- mid_score_ledger stay there, because the ledger is append-only.

BEGIN;

CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio', 'wavechat') $$;

UPDATE public.platform_features SET mode = 'preview' WHERE feature = 'conscience' AND mode = 'motorcars';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'conscience-cycles';
  END IF;
END $$;

-- Back to no sealed cycles on the MID ring
CREATE OR REPLACE FUNCTION public.get_public_mid(_user_id uuid)
RETURNS TABLE (mid text, score numeric, tier text, phone_verified boolean, issued_by text, cycles_sealed integer)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
           WHEN m.user_id = auth.uid()
             OR coalesce(p.show_phone_number, false)
             OR EXISTS (SELECT 1 FROM public.dealers d WHERE d.user_id = m.user_id AND d.status = 'verified')
           THEN m.mid
         END,
         public.mid_score(m.user_id), public.mid_tier_title(public.mid_score(m.user_id)),
         m.phone_verified, m.issued_by, 0
  FROM public.mid_identities m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.user_id = _user_id AND public.feature_mode('mid') = 'motorcars'
$$;

DROP FUNCTION IF EXISTS public.get_public_conscience(uuid);
DROP FUNCTION IF EXISTS public.conscience_uphold_report(uuid, text);
DROP FUNCTION IF EXISTS public.conscience_run();
DROP FUNCTION IF EXISTS public.refresh_my_conscience();
DROP FUNCTION IF EXISTS public.conscience_advance(uuid);
DROP FUNCTION IF EXISTS public.conscience_finding_cleared(public.conscience_findings, timestamptz);
DROP TABLE IF EXISTS public.conscience_findings;
DROP TABLE IF EXISTS public.conscience_cycles;
DROP FUNCTION IF EXISTS public.keep_conscience_findings();
DROP FUNCTION IF EXISTS public.keep_conscience_cycles();

COMMIT;
