-- Reverses 20261105120000_platform_features_and_mid.sql.
-- Deletes every issued MID and its points history: export mid_identities and mid_score_ledger first
-- if they hold anything worth keeping.

BEGIN;

DROP TRIGGER IF EXISTS award_business_approved ON public.dealers;
DROP FUNCTION IF EXISTS public.award_business_approved();
DROP FUNCTION IF EXISTS public.get_public_mid(uuid);
DROP FUNCTION IF EXISTS public.issue_my_mid();
DROP FUNCTION IF EXISTS public.mid_tier_title(numeric);
DROP FUNCTION IF EXISTS public.mid_score(uuid);
DROP FUNCTION IF EXISTS public.award_mid_points(uuid, text, text, text);
DROP TABLE IF EXISTS public.mid_score_ledger;
DROP FUNCTION IF EXISTS public.mid_from_phone(text);
DROP TABLE IF EXISTS public.mid_identities;
DROP FUNCTION IF EXISTS public.publish_score_config(text, jsonb);
DROP TABLE IF EXISTS public.mid_tiers;
DROP TABLE IF EXISTS public.mid_point_rules;
DROP TABLE IF EXISTS public.score_config_versions;
DROP TRIGGER IF EXISTS guard_platform_feature_mode ON public.platform_features;
DROP FUNCTION IF EXISTS public.guard_platform_feature_mode();
DROP FUNCTION IF EXISTS public.feature_mode(text);
DROP FUNCTION IF EXISTS public.motorcars_feature_built(text);
DROP FUNCTION IF EXISTS public.moatwave_connected();
DROP TABLE IF EXISTS public.platform_features;

COMMIT;
