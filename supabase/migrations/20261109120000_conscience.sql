-- Conscience Protocol, interim Motorcars version.
-- Requires, in order: 20261021120000_security_hardening.sql, 20261029120000_listing_lifecycle.sql,
-- 20261105120000_platform_features_and_mid.sql, 20261106120000_open_inventory.sql,
-- 20261107120000_wavechat.sql, 20261108120000_wavechat_conversation_features.sql.
--
-- Each seller with live cars runs 14-day cycles: 12 days observed, then 48 hours to reconcile, then
-- sealed for good. Findings come only from records Motorcars already keeps:
-- * not_confirmed: a live car with no confirmation or stock update during the 12 days
-- * chat_says_unavailable: the seller told a buyer the car is gone, but it is still listed available
-- * paid_still_available: a deposit or part payment was recorded, but the car is still listed available
-- * availability_lie: an admin upheld a buyer's report that a car shown available was already sold.
--   Nothing automatic can prove a lie, so a person decides from the evidence.
-- Points (values in mid_point_rules, seeded in 20261105120000): a clean cycle earns clean_cycle, and
-- two clean cycles sealed in one month earn two_clean_cycles_month. Unreconciled contradictions cost
-- unreconciled_mismatch per car; forgotten confirmations cost it once per cycle however many cars;
-- each upheld lie costs availability_lie. Cycles with no cars earn and cost nothing.
-- Cycles advance through conscience_run(), hourly where pg_cron is available, and whenever a
-- seller opens their record. Sealed cycles and their findings can never be changed.
-- Adds tables and functions only; no existing row is changed or deleted.
-- Reverse with supabase/rollback/20261109120000_conscience_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Cycles and findings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conscience_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Not a foreign key on purpose: a sealed record outlives the account
  seller_id uuid NOT NULL,
  cycle_number integer NOT NULL,
  status text NOT NULL DEFAULT 'observing' CHECK (status IN ('observing', 'reconciling', 'sealed')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  observation_ends_at timestamptz NOT NULL DEFAULT now() + interval '12 days',
  reconcile_ends_at timestamptz NOT NULL DEFAULT now() + interval '14 days',
  cars_tracked integer NOT NULL DEFAULT 0,
  cars_confirmed integer NOT NULL DEFAULT 0,
  outcome text CHECK (outcome IN ('clean', 'flagged', 'quiet')),
  points_awarded numeric(6, 2) NOT NULL DEFAULT 0,
  sealed_at timestamptz,
  -- Set once the sealed cycle has been sent to Moatwave
  synced_to_moatwave_at timestamptz,
  UNIQUE (seller_id, cycle_number)
);
CREATE UNIQUE INDEX IF NOT EXISTS conscience_one_open_cycle ON public.conscience_cycles (seller_id) WHERE status <> 'sealed';

CREATE TABLE IF NOT EXISTS public.conscience_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.conscience_cycles (id),
  seller_id uuid NOT NULL,
  -- Not a foreign key on purpose: findings outlive a deleted listing
  listing_id uuid NOT NULL,
  car_title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('not_confirmed', 'chat_says_unavailable', 'paid_still_available', 'availability_lie')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reconciled', 'unreconciled', 'upheld')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  UNIQUE (cycle_id, listing_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_conscience_findings_seller ON public.conscience_findings (seller_id, opened_at DESC);

ALTER TABLE public.conscience_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conscience_findings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sellers read their own cycles" ON public.conscience_cycles;
CREATE POLICY "Sellers read their own cycles" ON public.conscience_cycles
  FOR SELECT USING (auth.uid() = seller_id OR public.is_admin());
DROP POLICY IF EXISTS "Sellers read their own findings" ON public.conscience_findings;
CREATE POLICY "Sellers read their own findings" ON public.conscience_findings
  FOR SELECT USING (auth.uid() = seller_id OR public.is_admin());
-- No write policies: only the functions below change cycles and findings.

CREATE OR REPLACE FUNCTION public.keep_conscience_cycles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status <> 'sealed' THEN RETURN NEW; END IF;
  -- The only change to a sealed cycle is marking it as sent to Moatwave
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'synced_to_moatwave_at') = (to_jsonb(OLD) - 'synced_to_moatwave_at') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Conscience cycles cannot be deleted, and sealed cycles cannot be changed';
END;
$$;

DROP TRIGGER IF EXISTS keep_conscience_cycles ON public.conscience_cycles;
CREATE TRIGGER keep_conscience_cycles
  BEFORE UPDATE OR DELETE ON public.conscience_cycles
  FOR EACH ROW EXECUTE FUNCTION public.keep_conscience_cycles();

CREATE OR REPLACE FUNCTION public.keep_conscience_findings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NOT EXISTS (
    SELECT 1 FROM public.conscience_cycles WHERE id = OLD.cycle_id AND status = 'sealed') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Conscience findings cannot be deleted, and sealed findings cannot be changed';
END;
$$;

DROP TRIGGER IF EXISTS keep_conscience_findings ON public.conscience_findings;
CREATE TRIGGER keep_conscience_findings
  BEFORE UPDATE OR DELETE ON public.conscience_findings
  FOR EACH ROW EXECUTE FUNCTION public.keep_conscience_findings();

-- ---------------------------------------------------------------------------
-- 2. Moving a seller's cycle forward
-- ---------------------------------------------------------------------------
-- Whether a finding has been put right. A car that has left the live stock has nothing to reconcile.
CREATE OR REPLACE FUNCTION public.conscience_finding_cleared(_finding public.conscience_findings, _observation_ends_at timestamptz)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
      SELECT 1 FROM public.car_listings l
      WHERE l.id = _finding.listing_id AND l.status = 'active'
        AND l.availability_status IN ('available', 'reserved'))
    OR CASE _finding.kind
      WHEN 'not_confirmed' THEN EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = _finding.listing_id AND e.occurred_at > _observation_ends_at
          AND e.event_type IN ('availability_confirmed', 'made_available', 'reserved', 'renewed'))
      WHEN 'chat_says_unavailable' THEN EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = _finding.listing_id AND e.occurred_at > (_finding.evidence ->> 'said_at')::timestamptz
          AND e.event_type IN ('availability_confirmed', 'made_available', 'reserved'))
      -- Confirming isn't enough here: the car has to be reserved, or put back on sale after a refund
      WHEN 'paid_still_available' THEN EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = _finding.listing_id AND e.occurred_at > (_finding.evidence ->> 'paid_at')::timestamptz
          AND e.event_type IN ('made_available', 'reserved'))
      ELSE false
    END
$$;
REVOKE ALL ON FUNCTION public.conscience_finding_cleared(public.conscience_findings, timestamptz) FROM PUBLIC, anon, authenticated;

-- Internal: takes one step if one is due. Safe to call at any time and any number of times.
CREATE OR REPLACE FUNCTION public.conscience_advance(_seller_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  c public.conscience_cycles%ROWTYPE;
  f public.conscience_findings%ROWTYPE;
  tracked integer;
  confirmed integer;
  open_count integer;
  missed integer := 0;
  against integer := 0;
  earned numeric := 0;
  verdict text;
  month_label text;
BEGIN
  IF _seller_id IS NULL OR public.feature_mode('conscience') <> 'motorcars' THEN RETURN; END IF;

  SELECT * INTO c FROM public.conscience_cycles WHERE seller_id = _seller_id AND status <> 'sealed' FOR UPDATE;

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.car_listings WHERE user_id = _seller_id AND status = 'active'
               AND availability_status IN ('available', 'reserved')) THEN
      INSERT INTO public.conscience_cycles (seller_id, cycle_number)
      SELECT _seller_id, coalesce(max(cycle_number), 0) + 1 FROM public.conscience_cycles WHERE seller_id = _seller_id;
    END IF;
    RETURN;
  END IF;

  -- Day 12: compare the listings with what was recorded, and open the 48-hour window
  IF c.status = 'observing' AND now() >= c.observation_ends_at THEN
    SELECT count(*), count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.inventory_events e
             WHERE e.listing_id = l.id AND e.occurred_at >= c.starts_at AND NOT e.backfilled
               AND e.event_type IN ('availability_confirmed', 'made_available', 'reserved', 'listed', 'renewed')))
    INTO tracked, confirmed
    FROM public.car_listings l
    WHERE l.user_id = _seller_id AND l.status = 'active' AND l.availability_status IN ('available', 'reserved');

    INSERT INTO public.conscience_findings (cycle_id, seller_id, listing_id, car_title, kind, evidence)
    SELECT c.id, _seller_id, l.id, concat_ws(' ', l.year, l.make, l.model), 'not_confirmed',
           jsonb_build_object('last_confirmed_at', l.availability_confirmed_at)
    FROM public.car_listings l
    WHERE l.user_id = _seller_id AND l.status = 'active' AND l.availability_status IN ('available', 'reserved')
      AND NOT EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = l.id AND e.occurred_at >= c.starts_at AND NOT e.backfilled
          AND e.event_type IN ('availability_confirmed', 'made_available', 'reserved', 'listed', 'renewed'))
    ON CONFLICT (cycle_id, listing_id, kind) DO NOTHING;

    INSERT INTO public.conscience_findings (cycle_id, seller_id, listing_id, car_title, kind, evidence)
    SELECT c.id, _seller_id, l.id, concat_ws(' ', l.year, l.make, l.model), 'chat_says_unavailable',
           jsonb_build_object('said_at', s.said_at)
    FROM public.car_listings l
    CROSS JOIN LATERAL (
      SELECT max(m.created_at) AS said_at FROM public.messages m
      JOIN public.conversations v ON v.id = m.conversation_id
      WHERE v.listing_id = l.id AND m.sender_id = _seller_id
        AND m.action = 'reply_not_available' AND m.created_at >= c.starts_at
    ) s
    WHERE l.user_id = _seller_id AND l.status = 'active' AND l.availability_status = 'available'
      AND s.said_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = l.id AND e.occurred_at > s.said_at
          AND e.event_type IN ('availability_confirmed', 'made_available', 'reserved'))
    ON CONFLICT (cycle_id, listing_id, kind) DO NOTHING;

    INSERT INTO public.conscience_findings (cycle_id, seller_id, listing_id, car_title, kind, evidence)
    SELECT c.id, _seller_id, l.id, concat_ws(' ', l.year, l.make, l.model), 'paid_still_available',
           jsonb_build_object('paid_at', r.issued_at, 'receipt_number', r.receipt_number, 'receipt_kind', r.kind)
    FROM public.car_listings l
    CROSS JOIN LATERAL (
      SELECT sr.issued_at, sr.receipt_number, sr.kind FROM public.sale_receipts sr
      WHERE sr.listing_id = l.id AND sr.seller_id = _seller_id
        AND sr.kind IN ('deposit', 'part_payment') AND sr.issued_at >= c.starts_at
      ORDER BY sr.issued_at DESC LIMIT 1
    ) r
    WHERE l.user_id = _seller_id AND l.status = 'active' AND l.availability_status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM public.inventory_events e
        WHERE e.listing_id = l.id AND e.occurred_at > r.issued_at AND e.event_type IN ('made_available', 'reserved'))
    ON CONFLICT (cycle_id, listing_id, kind) DO NOTHING;

    -- A late run must still leave the seller their full 48 hours
    UPDATE public.conscience_cycles
    SET status = 'reconciling', cars_tracked = tracked, cars_confirmed = confirmed,
        reconcile_ends_at = greatest(reconcile_ends_at, now() + interval '48 hours')
    WHERE id = c.id;

    SELECT count(*) INTO open_count FROM public.conscience_findings WHERE cycle_id = c.id AND status = 'open';
    IF open_count > 0 THEN
      PERFORM public.create_notification(_seller_id, 'Your Conscience cycle needs attention',
        open_count || CASE WHEN open_count = 1 THEN ' item needs' ELSE ' items need' END
          || ' fixing within 48 hours, before this cycle is sealed for good.',
        'warning', jsonb_build_object('conscience_cycle_id', c.id));
    END IF;
    RETURN;
  END IF;

  -- During the window, show a seller what they've already put right
  IF c.status = 'reconciling' THEN
    FOR f IN SELECT * FROM public.conscience_findings WHERE cycle_id = c.id AND status = 'open' LOOP
      IF public.conscience_finding_cleared(f, c.observation_ends_at) THEN
        UPDATE public.conscience_findings SET status = 'reconciled', closed_at = now() WHERE id = f.id;
      END IF;
    END LOOP;
  END IF;

  -- Day 14: settle what's left, award and deduct points, and seal
  IF c.status = 'reconciling' AND now() >= c.reconcile_ends_at THEN
    FOR f IN SELECT * FROM public.conscience_findings WHERE cycle_id = c.id AND status = 'open' LOOP
      UPDATE public.conscience_findings SET status = 'unreconciled', closed_at = now() WHERE id = f.id;
      IF f.kind = 'not_confirmed' THEN
        missed := missed + 1;
      ELSE
        against := against + 1;
        earned := earned + public.award_mid_points(_seller_id, 'unreconciled_mismatch',
          'unreconciled_mismatch:' || f.id, 'conscience_findings:' || f.id);
      END IF;
    END LOOP;

    -- Forgotten confirmations aren't contradictions: one deduction per cycle however many cars
    IF missed > 0 THEN
      earned := earned + public.award_mid_points(_seller_id, 'unreconciled_mismatch',
        'unreconciled_mismatch:' || c.id || ':not_confirmed', 'conscience_cycles:' || c.id);
    END IF;

    FOR f IN SELECT * FROM public.conscience_findings WHERE cycle_id = c.id AND status = 'upheld' LOOP
      against := against + 1;
      earned := earned + public.award_mid_points(_seller_id, 'availability_lie',
        'availability_lie:' || f.id, 'conscience_findings:' || f.id);
    END LOOP;

    verdict := CASE
      WHEN missed > 0 OR against > 0 THEN 'flagged'
      WHEN c.cars_tracked = 0 THEN 'quiet'
      ELSE 'clean'
    END;

    IF verdict = 'clean' THEN
      earned := earned + public.award_mid_points(_seller_id, 'clean_cycle', 'clean_cycle:' || c.id, 'conscience_cycles:' || c.id);
      month_label := to_char(now() AT TIME ZONE 'Africa/Lagos', 'YYYY-MM');
      IF EXISTS (SELECT 1 FROM public.conscience_cycles
                 WHERE seller_id = _seller_id AND outcome = 'clean'
                   AND to_char(sealed_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM') = month_label) THEN
        earned := earned + public.award_mid_points(_seller_id, 'two_clean_cycles_month',
          'two_clean_cycles_month:' || _seller_id || ':' || month_label, 'conscience_cycles:' || c.id);
      END IF;
    END IF;

    UPDATE public.conscience_cycles
    SET status = 'sealed', outcome = verdict, points_awarded = earned, sealed_at = now()
    WHERE id = c.id;

    IF verdict <> 'quiet' THEN
      PERFORM public.create_notification(_seller_id,
        CASE verdict WHEN 'clean' THEN 'Clean Conscience cycle sealed' ELSE 'Conscience cycle sealed with problems' END,
        'Cycle ' || c.cycle_number || ' is sealed for good. See your record for the details.',
        CASE verdict WHEN 'clean' THEN 'success' ELSE 'warning' END,
        jsonb_build_object('conscience_cycle_id', c.id));
    END IF;

    -- The next cycle starts straight away if there are still live cars
    PERFORM public.conscience_advance(_seller_id);
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.conscience_advance(uuid) FROM PUBLIC, anon, authenticated;

-- A seller opening their record moves their own cycle on, so nothing waits on the hourly run.
CREATE OR REPLACE FUNCTION public.refresh_my_conscience()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to see your Conscience record'; END IF;
  PERFORM public.conscience_advance(auth.uid());
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_my_conscience() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_my_conscience() TO authenticated;

-- Moves every seller on. Run by the hourly job (no signed-in user) or by an admin.
CREATE OR REPLACE FUNCTION public.conscience_run()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  seller uuid;
  sellers integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can run Conscience cycles';
  END IF;
  FOR seller IN
    SELECT user_id FROM public.car_listings WHERE status = 'active' AND user_id IS NOT NULL
    UNION
    SELECT seller_id FROM public.conscience_cycles WHERE status <> 'sealed'
  LOOP
    PERFORM public.conscience_advance(seller);
    sellers := sellers + 1;
  END LOOP;
  RETURN sellers;
END;
$$;
REVOKE ALL ON FUNCTION public.conscience_run() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.conscience_run() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Upholding a report as an availability lie
-- ---------------------------------------------------------------------------
-- Only a person can call something a lie. An admin who has checked a buyer's report records it here;
-- the deduction lands when the seller's current cycle seals.
CREATE OR REPLACE FUNCTION public.conscience_uphold_report(_report_id uuid, _note text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r public.listing_reports%ROWTYPE;
  l public.car_listings%ROWTYPE;
  cycle uuid;
  finding uuid;
  note text := left(btrim(coalesce(_note, '')), 500);
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Only admins can uphold a report'; END IF;
  IF public.feature_mode('conscience') <> 'motorcars' THEN RAISE EXCEPTION 'Conscience is not switched on'; END IF;

  SELECT * INTO r FROM public.listing_reports WHERE id = _report_id FOR UPDATE;
  IF NOT FOUND OR r.status <> 'open' THEN RAISE EXCEPTION 'That report is no longer open'; END IF;
  IF r.reason <> 'sold_or_unavailable' THEN
    RAISE EXCEPTION 'Only a report that the car is sold or unavailable can be upheld as an availability lie';
  END IF;
  IF note = '' THEN RAISE EXCEPTION 'Write down the evidence you checked'; END IF;

  SELECT * INTO l FROM public.car_listings WHERE id = r.listing_id;
  IF l.user_id IS NULL THEN RAISE EXCEPTION 'This listing has no seller account'; END IF;

  PERFORM public.conscience_advance(l.user_id);
  SELECT id INTO cycle FROM public.conscience_cycles WHERE seller_id = l.user_id AND status <> 'sealed';
  IF cycle IS NULL THEN
    INSERT INTO public.conscience_cycles (seller_id, cycle_number)
    SELECT l.user_id, coalesce(max(cycle_number), 0) + 1 FROM public.conscience_cycles WHERE seller_id = l.user_id
    RETURNING id INTO cycle;
  END IF;

  INSERT INTO public.conscience_findings (cycle_id, seller_id, listing_id, car_title, kind, status, evidence, closed_at)
  VALUES (cycle, l.user_id, l.id, concat_ws(' ', l.year, l.make, l.model), 'availability_lie', 'upheld',
          jsonb_build_object('report_id', r.id, 'reported_at', r.created_at, 'note', note), now())
  ON CONFLICT (cycle_id, listing_id, kind) DO NOTHING
  RETURNING id INTO finding;

  UPDATE public.listing_reports
  SET status = 'resolved', resolved_at = now(), resolved_by = auth.uid(), admin_notes = note
  WHERE id = r.id;

  IF finding IS NOT NULL THEN
    PERFORM public.create_notification(l.user_id, 'A report about your car was upheld',
      'Motorcars checked a report that your ' || concat_ws(' ', l.year, l.make, l.model)
        || ' was shown available after it had gone. This is on your Conscience record.',
      'warning', jsonb_build_object('conscience_finding_id', finding));
  END IF;
  RETURN finding;
END;
$$;
REVOKE ALL ON FUNCTION public.conscience_uphold_report(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.conscience_uphold_report(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Reading
-- ---------------------------------------------------------------------------
-- What buyers see: how many cycles were sealed and how many were clean. Findings stay private.
-- Cycles with no cars prove nothing, so they don't count.
CREATE OR REPLACE FUNCTION public.get_public_conscience(_seller_id uuid)
RETURNS TABLE (cycles_sealed integer, clean_cycles integer, last_sealed_at timestamptz, cycle_in_progress boolean)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*)::int FROM public.conscience_cycles WHERE seller_id = _seller_id AND outcome IN ('clean', 'flagged')),
    (SELECT count(*)::int FROM public.conscience_cycles WHERE seller_id = _seller_id AND outcome = 'clean'),
    (SELECT max(sealed_at) FROM public.conscience_cycles WHERE seller_id = _seller_id AND outcome IN ('clean', 'flagged')),
    EXISTS (SELECT 1 FROM public.conscience_cycles WHERE seller_id = _seller_id AND status <> 'sealed')
  WHERE public.feature_mode('conscience') = 'motorcars'
$$;
GRANT EXECUTE ON FUNCTION public.get_public_conscience(uuid) TO anon, authenticated;

-- Sealed cycles are now real, so the MID ring can show them as notches
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
         m.phone_verified, m.issued_by,
         (SELECT count(*)::int FROM public.conscience_cycles k
          WHERE k.seller_id = m.user_id AND k.outcome IN ('clean', 'flagged'))
  FROM public.mid_identities m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.user_id = _user_id AND public.feature_mode('mid') = 'motorcars'
$$;

-- ---------------------------------------------------------------------------
-- 5. The hourly run, where pg_cron can be used
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron is unavailable, so Conscience cycles advance when sellers visit or an admin runs them';
  END;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('conscience-cycles', '17 * * * *', 'SELECT public.conscience_run()');
  END IF;
END $$;

-- The Motorcars version of Conscience now exists, so admins may switch it on
CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio', 'wavechat', 'conscience') $$;

COMMIT;
