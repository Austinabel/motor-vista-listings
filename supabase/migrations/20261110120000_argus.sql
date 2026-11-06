-- Argus, interim Motorcars version: Claude answering from real listings, with a spending cap.
-- Requires 20261109120000_conscience.sql (and everything it requires).
--
-- Claude runs in the supabase/functions/argus server function, which holds the API key. This
-- migration adds what that function checks and writes:
-- * argus_settings: the monthly cap in US dollars and the questions each person may ask per day.
--   The cap starts at 0, so nothing is spent until an admin sets one.
-- * argus_usage: tokens and cost for each question. The question itself is never stored.
-- Below the cap Argus answers with Claude; at the cap, or with no API key, the app falls back to
-- the fixed rules in src/lib/argus.ts.
-- Adds tables and functions only; no existing row is changed or deleted.
-- Reverse with supabase/rollback/20261110120000_argus_down.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS public.argus_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  monthly_cap_usd numeric(8, 2) NOT NULL DEFAULT 0 CHECK (monthly_cap_usd >= 0),
  daily_questions_per_user integer NOT NULL DEFAULT 20 CHECK (daily_questions_per_user BETWEEN 0 AND 1000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);
INSERT INTO public.argus_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.argus_usage (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  surface text NOT NULL CHECK (surface IN ('search', 'car')),
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric(10, 6) NOT NULL DEFAULT 0,
  outcome text NOT NULL CHECK (outcome IN ('answered', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_argus_usage_month ON public.argus_usage (created_at);
CREATE INDEX IF NOT EXISTS idx_argus_usage_user ON public.argus_usage (user_id, created_at DESC);

ALTER TABLE public.argus_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.argus_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read Argus settings" ON public.argus_settings;
CREATE POLICY "Admins read Argus settings" ON public.argus_settings FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins change Argus settings" ON public.argus_settings;
CREATE POLICY "Admins change Argus settings" ON public.argus_settings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins read Argus usage" ON public.argus_usage;
CREATE POLICY "Admins read Argus usage" ON public.argus_usage FOR SELECT USING (public.is_admin());
-- No write policies on argus_usage: only the server function records usage.

CREATE OR REPLACE FUNCTION public.stamp_argus_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_argus_settings ON public.argus_settings;
CREATE TRIGGER stamp_argus_settings
  BEFORE UPDATE ON public.argus_settings
  FOR EACH ROW EXECUTE FUNCTION public.stamp_argus_settings();

CREATE OR REPLACE FUNCTION public.argus_month_start()
RETURNS timestamptz
LANGUAGE sql STABLE
SET search_path TO 'public'
AS $$ SELECT date_trunc('month', now() AT TIME ZONE 'Africa/Lagos') AT TIME ZONE 'Africa/Lagos' $$;

-- Asked by the server function before every question. 'ok' means Claude may be called.
CREATE OR REPLACE FUNCTION public.argus_gate(_user_id uuid)
RETURNS text
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s public.argus_settings%ROWTYPE;
BEGIN
  IF public.feature_mode('argus') <> 'motorcars' THEN RETURN 'off'; END IF;
  SELECT * INTO s FROM public.argus_settings;
  IF (SELECT coalesce(sum(cost_usd), 0) FROM public.argus_usage WHERE created_at >= public.argus_month_start()) >= s.monthly_cap_usd THEN
    RETURN 'budget';
  END IF;
  IF (SELECT count(*) FROM public.argus_usage
      WHERE user_id = _user_id
        AND created_at >= date_trunc('day', now() AT TIME ZONE 'Africa/Lagos') AT TIME ZONE 'Africa/Lagos')
     >= s.daily_questions_per_user THEN
    RETURN 'daily_limit';
  END IF;
  RETURN 'ok';
END;
$$;

CREATE OR REPLACE FUNCTION public.argus_record_usage(
  _user_id uuid, _surface text, _model text, _input_tokens integer, _output_tokens integer, _cost_usd numeric, _outcome text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.argus_usage (user_id, surface, model, input_tokens, output_tokens, cost_usd, outcome)
  VALUES (_user_id, _surface, _model, _input_tokens, _output_tokens, _cost_usd, _outcome)
$$;

REVOKE ALL ON FUNCTION public.argus_gate(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.argus_record_usage(uuid, text, text, integer, integer, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.argus_gate(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.argus_record_usage(uuid, text, text, integer, integer, numeric, text) TO service_role;

-- What the admin panel shows.
CREATE OR REPLACE FUNCTION public.get_argus_budget()
RETURNS TABLE (monthly_cap_usd numeric, daily_questions_per_user integer, spent_this_month_usd numeric, questions_this_month integer)
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Only admins can see Argus spending'; END IF;
  RETURN QUERY
  SELECT s.monthly_cap_usd, s.daily_questions_per_user,
         (SELECT coalesce(sum(u.cost_usd), 0) FROM public.argus_usage u WHERE u.created_at >= public.argus_month_start()),
         (SELECT count(*)::int FROM public.argus_usage u WHERE u.created_at >= public.argus_month_start())
  FROM public.argus_settings s;
END;
$$;
REVOKE ALL ON FUNCTION public.get_argus_budget() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_argus_budget() TO authenticated;

-- The Motorcars version of Argus now exists, so admins may switch it on
CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio', 'wavechat', 'conscience', 'argus') $$;

COMMIT;
