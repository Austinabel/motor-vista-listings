-- Removes test accounts, test dealers and test cars, with everything attached to them:
-- chats, offers, receipts, history, Conscience cycles, MID points (including points a real seller
-- earned from a test buyer's receipt), favourites, reports and notifications.
--
-- 1. Fill in the settings below (emails from 01_find_test_data.sql).
-- 2. Run it as it is. really_delete is false, so it only counts what would go and changes nothing.
-- 3. If the counts look right, change really_delete to true and run it again.
--
-- It refuses to remove an admin account, and stops if an email or id isn't found.
-- Car photos stay in Storage; delete those folders in Storage afterwards if wanted.
-- Everything runs as one step: if anything fails, nothing is removed.

BEGIN;

DROP TABLE IF EXISTS pg_temp.cleanup_settings, pg_temp.cleanup_users, pg_temp.cleanup_dealers,
  pg_temp.cleanup_listings, pg_temp.cleanup_conversations, pg_temp.cleanup_receipts,
  pg_temp.cleanup_promises, pg_temp.cleanup_cycles, pg_temp.cleanup_refs, pg_temp.cleanup_steps;

-- ── Settings ────────────────────────────────────────────────────────────────
CREATE TEMP TABLE cleanup_settings AS SELECT
  -- Test accounts: everything they own goes, and the account itself
  ARRAY[
    'test-account@example.com'
  ]::text[] AS emails,
  -- Dealers without an account of their own, e.g. ARRAY['c9847a70-...']::uuid[]
  ARRAY[]::uuid[] AS dealer_ids,
  -- Single cars, e.g. ARRAY['76ba6d9b-...']::uuid[]
  ARRAY[]::uuid[] AS listing_ids,
  false AS really_delete;
-- ────────────────────────────────────────────────────────────────────────────

CREATE TEMP TABLE cleanup_users AS
  SELECT id, email FROM auth.users
  WHERE lower(email) IN (SELECT lower(trim(e)) FROM cleanup_settings, unnest(emails) e);

CREATE TEMP TABLE cleanup_dealers AS
  SELECT id FROM public.dealers
  WHERE id IN (SELECT unnest(dealer_ids) FROM cleanup_settings)
     OR user_id IN (SELECT id FROM cleanup_users);

CREATE TEMP TABLE cleanup_listings AS
  SELECT id FROM public.car_listings
  WHERE id IN (SELECT unnest(listing_ids) FROM cleanup_settings)
     OR user_id IN (SELECT id FROM cleanup_users);

CREATE TEMP TABLE cleanup_conversations AS
  SELECT id FROM public.conversations
  WHERE buyer_id IN (SELECT id FROM cleanup_users)
     OR seller_id IN (SELECT id FROM cleanup_users)
     OR listing_id IN (SELECT id FROM cleanup_listings);

CREATE TEMP TABLE cleanup_receipts AS
  SELECT id FROM public.sale_receipts
  WHERE conversation_id IN (SELECT id FROM cleanup_conversations)
     OR listing_id IN (SELECT id FROM cleanup_listings)
     OR buyer_id IN (SELECT id FROM cleanup_users)
     OR seller_id IN (SELECT id FROM cleanup_users);

CREATE TEMP TABLE cleanup_promises AS
  SELECT id FROM public.payment_promises
  WHERE conversation_id IN (SELECT id FROM cleanup_conversations)
     OR buyer_id IN (SELECT id FROM cleanup_users)
     OR seller_id IN (SELECT id FROM cleanup_users);

CREATE TEMP TABLE cleanup_cycles AS
  SELECT id FROM public.conscience_cycles WHERE seller_id IN (SELECT id FROM cleanup_users);

-- What MID points were earned from, as written in mid_score_ledger.source_ref
CREATE TEMP TABLE cleanup_refs AS
  SELECT 'car_listings:' || id AS ref FROM cleanup_listings
  UNION ALL SELECT 'sale_receipts:' || id FROM cleanup_receipts
  UNION ALL SELECT 'payment_promises:' || id FROM cleanup_promises
  UNION ALL SELECT 'conscience_cycles:' || id FROM cleanup_cycles;

-- In delete order: rows that point at others go first
CREATE TEMP TABLE cleanup_steps (ord int PRIMARY KEY, label text, tbl text, cond text, rows bigint);
INSERT INTO cleanup_steps (ord, label, tbl, cond) VALUES
  (1,  'MID points',                  'public.mid_score_ledger',
       'user_id IN (SELECT id FROM cleanup_users) OR source_ref IN (SELECT ref FROM cleanup_refs)'),
  (2,  'Conscience findings',         'public.conscience_findings',
       'seller_id IN (SELECT id FROM cleanup_users) OR listing_id IN (SELECT id FROM cleanup_listings) OR cycle_id IN (SELECT id FROM cleanup_cycles)'),
  (3,  'Conscience cycles',           'public.conscience_cycles', 'id IN (SELECT id FROM cleanup_cycles)'),
  (4,  'Receipts',                    'public.sale_receipts', 'id IN (SELECT id FROM cleanup_receipts)'),
  (5,  'Payment promises',            'public.payment_promises', 'id IN (SELECT id FROM cleanup_promises)'),
  (6,  'Handover checklists',         'public.handover_items', 'conversation_id IN (SELECT id FROM cleanup_conversations)'),
  (7,  'Message reactions',           'public.message_reactions',
       'user_id IN (SELECT id FROM cleanup_users) OR message_id IN (SELECT id FROM public.messages WHERE conversation_id IN (SELECT id FROM cleanup_conversations))'),
  (8,  'Messages',                    'public.messages', 'conversation_id IN (SELECT id FROM cleanup_conversations)'),
  (9,  'Chats',                       'public.conversations', 'id IN (SELECT id FROM cleanup_conversations)'),
  (10, 'Car history',                 'public.inventory_events',
       'listing_id IN (SELECT id FROM cleanup_listings) OR seller_id IN (SELECT id FROM cleanup_users)'),
  (11, 'Reports',                     'public.listing_reports',
       'listing_id IN (SELECT id FROM cleanup_listings) OR reporter_id IN (SELECT id FROM cleanup_users)'),
  (12, 'Saved cars',                  'public.favorites',
       'user_id IN (SELECT id FROM cleanup_users) OR listing_id IN (SELECT id FROM cleanup_listings)'),
  (13, 'Listing upgrade requests',    'public.listing_enhancement_requests',
       'user_id IN (SELECT id FROM cleanup_users) OR listing_id IN (SELECT id FROM cleanup_listings)'),
  (14, 'Car photos (records only)',   'public.car_listing_images', 'listing_id IN (SELECT id FROM cleanup_listings)'),
  (15, 'Cars',                        'public.car_listings', 'id IN (SELECT id FROM cleanup_listings)'),
  (16, 'Dealers',                     'public.dealers', 'id IN (SELECT id FROM cleanup_dealers)'),
  (17, 'Notifications',               'public.notifications', 'user_id IN (SELECT id FROM cleanup_users)'),
  (18, 'Argus usage',                 'public.argus_usage', 'user_id IN (SELECT id FROM cleanup_users)'),
  (19, 'Online status',               'public.user_presence', 'user_id IN (SELECT id FROM cleanup_users)'),
  (20, 'MIDs',                        'public.mid_identities', 'user_id IN (SELECT id FROM cleanup_users)'),
  (21, 'Roles',                       'public.user_roles', 'user_id IN (SELECT id FROM cleanup_users)'),
  (22, 'Profiles',                    'public.profiles', 'id IN (SELECT id FROM cleanup_users)'),
  (23, 'Accounts',                    'auth.users', 'id IN (SELECT id FROM cleanup_users)');

DO $$
DECLARE
  go boolean;
  problem text;
  s record;
  n bigint;
BEGIN
  SELECT really_delete INTO go FROM cleanup_settings;

  SELECT string_agg(e, ', ') INTO problem FROM cleanup_settings, unnest(emails) e
  WHERE lower(trim(e)) NOT IN (SELECT lower(email) FROM cleanup_users);
  IF problem IS NOT NULL THEN RAISE EXCEPTION 'No account with this email: %', problem; END IF;

  SELECT string_agg(i::text, ', ') INTO problem FROM cleanup_settings, unnest(dealer_ids) i
  WHERE i NOT IN (SELECT id FROM public.dealers);
  IF problem IS NOT NULL THEN RAISE EXCEPTION 'No dealer with this id: %', problem; END IF;

  SELECT string_agg(i::text, ', ') INTO problem FROM cleanup_settings, unnest(listing_ids) i
  WHERE i NOT IN (SELECT id FROM public.car_listings);
  IF problem IS NOT NULL THEN RAISE EXCEPTION 'No car with this id: %', problem; END IF;

  SELECT string_agg(u.email, ', ') INTO problem FROM cleanup_users u
  WHERE EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role::text = 'admin')
     OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id AND p.user_type::text = 'admin');
  IF problem IS NOT NULL THEN RAISE EXCEPTION 'Refusing to remove an admin account: %', problem; END IF;

  -- History, receipts and Conscience records are locked against deletion; unlock them only for this step
  IF go THEN
    ALTER TABLE public.inventory_events DISABLE TRIGGER keep_inventory_events;
    ALTER TABLE public.sale_receipts DISABLE TRIGGER keep_sale_receipts;
    ALTER TABLE public.conscience_cycles DISABLE TRIGGER keep_conscience_cycles;
    ALTER TABLE public.conscience_findings DISABLE TRIGGER keep_conscience_findings;
  END IF;

  FOR s IN SELECT * FROM cleanup_steps ORDER BY ord LOOP
    CONTINUE WHEN to_regclass(s.tbl) IS NULL;
    IF go THEN
      EXECUTE format('DELETE FROM %s WHERE %s', s.tbl, s.cond);
      GET DIAGNOSTICS n = ROW_COUNT;
    ELSE
      EXECUTE format('SELECT count(*) FROM %s WHERE %s', s.tbl, s.cond) INTO n;
    END IF;
    UPDATE cleanup_steps SET rows = n WHERE ord = s.ord;
  END LOOP;

  IF go THEN
    ALTER TABLE public.inventory_events ENABLE TRIGGER keep_inventory_events;
    ALTER TABLE public.sale_receipts ENABLE TRIGGER keep_sale_receipts;
    ALTER TABLE public.conscience_cycles ENABLE TRIGGER keep_conscience_cycles;
    ALTER TABLE public.conscience_findings ENABLE TRIGGER keep_conscience_findings;
  END IF;
END;
$$;

COMMIT;

SELECT CASE WHEN s.really_delete THEN 'Removed' ELSE 'Would remove (nothing changed yet)' END AS result,
       c.label AS what,
       c.rows
FROM cleanup_steps c, cleanup_settings s
WHERE c.rows > 0
ORDER BY c.ord;
