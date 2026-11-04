-- Platform feature switches and the Motorcars MID (Moatwave identity, interim version).
-- Requires 20261021120000_security_hardening.sql (applied first, as with the lifecycle migration).
--
-- Adds tables and functions only; no existing row is changed or deleted.
-- * platform_features: one row per Moatwave feature with the mode admins choose:
--   off | preview | motorcars (built here, interim) | moatwave (refused until the Moatwave connection exists).
-- * Versioned scoring config (PRD Part A3): point values and tier titles live in tables, never in code,
--   and a new version never re-scores entries already in the ledger.
-- * mid_identities: the MID, made from the account's phone number by the PRD rule (leading 0 dropped,
--   digits reversed). Marked unverified until SMS verification exists.
-- * mid_score_ledger: append-only points history; idempotent through a unique event key.
-- Reverse with supabase/rollback/20261105120000_platform_features_and_mid_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Feature switches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_features (
  feature text PRIMARY KEY CHECK (feature IN ('mid', 'wavechat', 'oio', 'conscience', 'argus')),
  mode text NOT NULL DEFAULT 'preview' CHECK (mode IN ('off', 'preview', 'motorcars', 'moatwave')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

INSERT INTO public.platform_features (feature, mode)
VALUES ('mid', 'preview'), ('wavechat', 'preview'), ('oio', 'preview'), ('conscience', 'preview'), ('argus', 'preview')
ON CONFLICT (feature) DO NOTHING;

ALTER TABLE public.platform_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read platform features" ON public.platform_features;
CREATE POLICY "Anyone can read platform features" ON public.platform_features
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can change platform features" ON public.platform_features;
CREATE POLICY "Admins can change platform features" ON public.platform_features
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Replaced by a real check once a Moatwave connection is configured.
CREATE OR REPLACE FUNCTION public.moatwave_connected()
RETURNS boolean
LANGUAGE sql STABLE
SET search_path TO 'public'
AS $$ SELECT false $$;

-- Features whose Motorcars version exists. Extended by each later feature migration.
CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid') $$;

CREATE OR REPLACE FUNCTION public.guard_platform_feature_mode()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.mode = 'moatwave' AND NOT public.moatwave_connected() THEN
    RAISE EXCEPTION 'Moatwave is not connected yet, so % cannot be switched to Moatwave', NEW.feature;
  END IF;
  IF NEW.mode = 'motorcars' AND NOT public.motorcars_feature_built(NEW.feature) THEN
    RAISE EXCEPTION 'The Motorcars version of % is not built yet', NEW.feature;
  END IF;
  NEW.feature := OLD.feature;
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_platform_feature_mode ON public.platform_features;
CREATE TRIGGER guard_platform_feature_mode
  BEFORE UPDATE ON public.platform_features
  FOR EACH ROW EXECUTE FUNCTION public.guard_platform_feature_mode();

CREATE OR REPLACE FUNCTION public.feature_mode(_feature text)
RETURNS text
LANGUAGE sql STABLE
SET search_path TO 'public'
AS $$ SELECT coalesce((SELECT mode FROM public.platform_features WHERE feature = _feature), 'off') $$;

-- ---------------------------------------------------------------------------
-- 2. Versioned scoring config
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.score_config_versions (
  id serial PRIMARY KEY,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS score_config_one_active ON public.score_config_versions (is_active) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.mid_point_rules (
  version_id integer NOT NULL REFERENCES public.score_config_versions (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points numeric(6, 2) NOT NULL,
  label text NOT NULL,
  PRIMARY KEY (version_id, event_type)
);

CREATE TABLE IF NOT EXISTS public.mid_tiers (
  version_id integer NOT NULL REFERENCES public.score_config_versions (id) ON DELETE CASCADE,
  min_score integer NOT NULL CHECK (min_score BETWEEN 0 AND 1000),
  title text NOT NULL,
  PRIMARY KEY (version_id, min_score)
);

-- Version 1: the Moatwave PRD point table (Section 7.1) and tiers (Section 5), mapped to car events.
-- Rules for events Motorcars has not built yet are seeded now so later features need no new version.
DO $$
DECLARE v integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.score_config_versions) THEN
    INSERT INTO public.score_config_versions (label, is_active)
    VALUES ('Motorcars interim 1 (from Moatwave PRD point table)', true)
    RETURNING id INTO v;

    INSERT INTO public.mid_point_rules (version_id, event_type, points, label) VALUES
      (v, 'registration_complete', 4, 'Personal registration complete'),
      (v, 'business_approved', 6, 'Dealer business approved'),
      (v, 'mid_generated', 10, 'MID generated'),
      (v, 'availability_confirmed', 0.3, 'Car availability confirmed'),
      (v, 'sale_recorded', 0.3, 'Car marked sold'),
      (v, 'receipt_sent', 0.2, 'Receipt sent'),
      (v, 'clean_cycle', 6, 'Clean 14-day Conscience cycle'),
      (v, 'two_clean_cycles_month', 8, 'Two clean cycles in one month'),
      (v, 'unreconciled_mismatch', -6, 'Unreconciled inventory mismatch'),
      (v, 'availability_lie', -8, 'Car shown available but already sold'),
      (v, 'failed_delivery_promise', -4, 'Failed promise reported through WaveChat');

    INSERT INTO public.mid_tiers (version_id, min_score, title) VALUES
      (v, 0, 'Unranked'),
      (v, 50, 'Market Man / Market Woman'),
      (v, 300, 'Oga Market / Market Madam'),
      (v, 500, 'Express Trader'),
      (v, 700, 'Chief Trader / Chief Madam'),
      (v, 850, 'Eze Afia / Lolo Afia'),
      (v, 930, 'Market Grand Commander');
  END IF;
END $$;

ALTER TABLE public.score_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mid_point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mid_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read score config" ON public.score_config_versions;
CREATE POLICY "Anyone can read score config" ON public.score_config_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can read point rules" ON public.mid_point_rules;
CREATE POLICY "Anyone can read point rules" ON public.mid_point_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can read tiers" ON public.mid_tiers;
CREATE POLICY "Anyone can read tiers" ON public.mid_tiers FOR SELECT USING (true);
-- No write policies: a new version is created through publish_score_config (admins only).

CREATE OR REPLACE FUNCTION public.publish_score_config(_label text, _rules jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_version integer;
  new_version integer;
  rule jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change point values';
  END IF;
  SELECT id INTO old_version FROM public.score_config_versions WHERE is_active;

  UPDATE public.score_config_versions SET is_active = false WHERE is_active;
  INSERT INTO public.score_config_versions (label, is_active, created_by)
  VALUES (_label, true, auth.uid()) RETURNING id INTO new_version;

  -- Start from the old version, then apply the changed values
  INSERT INTO public.mid_point_rules (version_id, event_type, points, label)
  SELECT new_version, event_type, points, label FROM public.mid_point_rules WHERE version_id = old_version;
  INSERT INTO public.mid_tiers (version_id, min_score, title)
  SELECT new_version, min_score, title FROM public.mid_tiers WHERE version_id = old_version;

  FOR rule IN SELECT * FROM jsonb_array_elements(coalesce(_rules, '[]'::jsonb)) LOOP
    UPDATE public.mid_point_rules
       SET points = (rule ->> 'points')::numeric
     WHERE version_id = new_version AND event_type = rule ->> 'event_type';
  END LOOP;

  RETURN new_version;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. MID identities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mid_identities (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  mid text NOT NULL UNIQUE CHECK (mid ~ '^[0-9]{10}$'),
  phone_verified boolean NOT NULL DEFAULT false,
  -- 'motorcars' while issued here; 'moatwave' once confirmed by Moatwave
  issued_by text NOT NULL DEFAULT 'motorcars' CHECK (issued_by IN ('motorcars', 'moatwave')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mid_identities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read their own MID" ON public.mid_identities;
CREATE POLICY "Users read their own MID" ON public.mid_identities
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
-- No insert/update policies: MIDs are issued only by issue_my_mid.

-- Nigerian number → MID: 08031234567 / +2348031234567 / 2348031234567 → 8031234567 → reversed.
CREATE OR REPLACE FUNCTION public.mid_from_phone(_phone text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE digits text := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
BEGIN
  IF digits ~ '^234[0-9]{10}$' THEN
    digits := substr(digits, 4);
  ELSIF digits ~ '^0[0-9]{10}$' THEN
    digits := substr(digits, 2);
  END IF;
  IF digits !~ '^[1-9][0-9]{9}$' THEN
    RETURN NULL;
  END IF;
  RETURN reverse(digits);
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Points ledger
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mid_score_ledger (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points numeric(6, 2) NOT NULL,
  config_version_id integer NOT NULL REFERENCES public.score_config_versions (id),
  -- What earned the points, e.g. 'car_listings:<id>'; shown to the owner as evidence
  source_ref text,
  -- One award per real event, so retries never double-count
  event_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mid_score_ledger_user ON public.mid_score_ledger (user_id, created_at DESC);

ALTER TABLE public.mid_score_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read their own points" ON public.mid_score_ledger;
CREATE POLICY "Users read their own points" ON public.mid_score_ledger
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
-- No write policies: points are awarded only by award_mid_points.

-- Internal: awards points under the active config, only while the MID feature runs on Motorcars
-- and the person has a MID. Returns the points awarded (0 when nothing was recorded).
CREATE OR REPLACE FUNCTION public.award_mid_points(_user_id uuid, _event_type text, _event_key text, _source_ref text DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v integer;
  pts numeric;
BEGIN
  IF public.feature_mode('mid') <> 'motorcars' THEN RETURN 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mid_identities WHERE user_id = _user_id) THEN RETURN 0; END IF;

  SELECT id INTO v FROM public.score_config_versions WHERE is_active;
  SELECT points INTO pts FROM public.mid_point_rules WHERE version_id = v AND event_type = _event_type;
  IF pts IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.mid_score_ledger (user_id, event_type, points, config_version_id, source_ref, event_key)
  VALUES (_user_id, _event_type, pts, v, _source_ref, _event_key)
  ON CONFLICT (event_key) DO NOTHING;
  RETURN CASE WHEN FOUND THEN pts ELSE 0 END;
END;
$$;
REVOKE ALL ON FUNCTION public.award_mid_points(uuid, text, text, text) FROM PUBLIC, anon, authenticated;

-- Score = sum of the ledger, kept within 0–1000.
CREATE OR REPLACE FUNCTION public.mid_score(_user_id uuid)
RETURNS numeric
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT least(1000, greatest(0, coalesce(sum(points), 0))) FROM public.mid_score_ledger WHERE user_id = _user_id
$$;
REVOKE ALL ON FUNCTION public.mid_score(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.mid_tier_title(_score numeric)
RETURNS text
LANGUAGE sql STABLE
SET search_path TO 'public'
AS $$
  SELECT t.title FROM public.mid_tiers t
  JOIN public.score_config_versions v ON v.id = t.version_id AND v.is_active
  WHERE t.min_score <= _score ORDER BY t.min_score DESC LIMIT 1
$$;

-- ---------------------------------------------------------------------------
-- 5. Issuing a MID and reading MIDs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_my_mid()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  me uuid := auth.uid();
  new_mid text;
  existing text;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Sign in to get a MID'; END IF;
  IF public.feature_mode('mid') <> 'motorcars' THEN RAISE EXCEPTION 'MID is not available yet'; END IF;

  SELECT mid INTO existing FROM public.mid_identities WHERE user_id = me;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  SELECT public.mid_from_phone(phone) INTO new_mid FROM public.profiles WHERE id = me;
  IF new_mid IS NULL THEN
    RAISE EXCEPTION 'Add a valid Nigerian phone number to your profile first';
  END IF;
  IF EXISTS (SELECT 1 FROM public.mid_identities WHERE mid = new_mid) THEN
    RAISE EXCEPTION 'This phone number already has a MID on another account. One person, one MID.';
  END IF;

  INSERT INTO public.mid_identities (user_id, mid) VALUES (me, new_mid);
  PERFORM public.award_mid_points(me, 'registration_complete', 'registration_complete:' || me);
  PERFORM public.award_mid_points(me, 'mid_generated', 'mid_generated:' || me);
  -- Dealers approved before they had a MID get their business points now
  IF EXISTS (SELECT 1 FROM public.dealers WHERE user_id = me AND status = 'verified') THEN
    PERFORM public.award_mid_points(me, 'business_approved', 'business_approved:' || me);
  END IF;
  RETURN new_mid;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_my_mid() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_my_mid() TO authenticated;

-- Public view of a person's MID: ring score, tier, verification. No ledger detail.
-- A MID is the phone number reversed, so the number itself is shown only where the phone number
-- already is public: approved dealers, and people who chose to show their phone number.
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
GRANT EXECUTE ON FUNCTION public.get_public_mid(uuid) TO anon, authenticated;

-- Dealer approval earns the business points (PRD: business setup complete).
CREATE OR REPLACE FUNCTION public.award_business_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status IS DISTINCT FROM 'verified' AND NEW.user_id IS NOT NULL THEN
    PERFORM public.award_mid_points(NEW.user_id, 'business_approved', 'business_approved:' || NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_business_approved ON public.dealers;
CREATE TRIGGER award_business_approved
  AFTER UPDATE OF status ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.award_business_approved();

COMMIT;
