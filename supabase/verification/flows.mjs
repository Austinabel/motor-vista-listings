// Runs supabase/staging/bootstrap.sql on a throwaway Postgres, then the real flows as simulated
// signed-in users: feature switches, MID, Open Inventory, WaveChat, Conscience, Argus' limits, and who is refused what.
// Touches no Supabase project. PGlite is not a project dependency, so to run this:
//   npm i --no-save @electric-sql/pglite@0.3.15
//   node scripts/build-staging-bootstrap.mjs
//   node supabase/verification/flows.mjs supabase/staging/bootstrap.sql
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import { readFileSync } from "node:fs";

const db = new PGlite({ extensions: { pgcrypto, uuid_ossp } });
// Stand-ins for the parts of Supabase that plain Postgres lacks
await db.exec(`
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  DO $$ BEGIN
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END $$;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
  CREATE SCHEMA auth; CREATE SCHEMA storage;
  GRANT USAGE ON SCHEMA auth, storage TO anon, authenticated, service_role;
  CREATE TABLE auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, raw_user_meta_data jsonb DEFAULT '{}', created_at timestamptz DEFAULT now());
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
  CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean DEFAULT false, file_size_limit bigint, allowed_mime_types text[]);
  CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  CREATE PUBLICATION supabase_realtime;
`);
await db.exec(readFileSync(process.argv[2], "utf8"));
console.log("bootstrap ran");

let pass = 0, fail = 0;
const as = async (user, fn) => {
  await db.exec(user ? `SELECT set_config('request.jwt.sub','${user}',false); SET ROLE authenticated;` : `SELECT set_config('request.jwt.sub','',false); SET ROLE anon;`);
  try { return await fn(); } finally { await db.exec(`RESET ROLE; SELECT set_config('request.jwt.sub','',false);`); }
};
const q = async (sql, params) => (await db.query(sql, params)).rows;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name} ${cond ? "" : extra}`); };
const step = async (name, fn) => { try { await fn(); pass++; console.log("PASS ", name); } catch (e) { fail++; console.log("FAIL ", name, "::", e.message); } };
const refused = async (name, fn, re) => { try { await fn(); fail++; console.log("FAIL ", name, ":: was allowed"); } catch (e) { const good = !re || re.test(e.message); good ? pass++ : fail++; console.log(`${good ? "PASS" : "FAIL"}  ${name}${good ? "" : " :: " + e.message}`); } };

const seller = "11111111-1111-1111-1111-111111111111", buyer = "22222222-2222-2222-2222-222222222222", stranger = "33333333-3333-3333-3333-333333333333", admin = "44444444-4444-4444-4444-444444444444";
for (const [id, e] of [[seller, "s@x.ng"], [buyer, "b@x.ng"], [stranger, "t@x.ng"], [admin, "a@x.ng"]]) await db.query("INSERT INTO auth.users (id,email) VALUES ($1,$2)", [id, e]);
await db.exec(`INSERT INTO public.profiles (id, first_name, last_name, phone) VALUES
  ('${seller}','Sade','A','07038259694'),('${buyer}','Bala','B','08031234567'),('${stranger}','Tom','C','08051112222'),('${admin}','Ada','D',NULL)
  ON CONFLICT (id) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, phone=EXCLUDED.phone;
  INSERT INTO public.user_roles (user_id, role) VALUES ('${admin}','admin') ON CONFLICT DO NOTHING;`);
console.log("users ready");

// Feature switches
await refused("moatwave mode is refused", () => as(admin, () => q("UPDATE platform_features SET mode='moatwave' WHERE feature='mid'")), /not connected/);
ok("an unknown feature counts as not built", (await q("SELECT public.motorcars_feature_built('nonsense') b"))[0].b === false);
await step("admin turns on all five features", () => as(admin, () => q("UPDATE platform_features SET mode='motorcars' WHERE feature IN ('mid','oio','wavechat','conscience','argus')")));
ok("non-admin can't change a feature", (await as(stranger, () => q("UPDATE platform_features SET mode='off' WHERE feature='mid' RETURNING feature"))).length === 0);

// MID
let mid;
await step("seller creates MID", async () => { mid = (await as(seller, () => q("SELECT public.issue_my_mid() m")))[0].m; });
ok("MID follows the PRD example", mid === "4969528307", mid);
await step("buyer creates MID", () => as(buyer, () => q("SELECT public.issue_my_mid()")));
const points = async (u) => Number((await q("SELECT coalesce(sum(points),0) p FROM mid_score_ledger WHERE user_id=$1", [u]))[0].p);
ok("MID awards registration + generated", (await points(seller)) === 14, await points(seller));
await step("issuing twice is harmless", () => as(seller, () => q("SELECT public.issue_my_mid()")));
ok("no double points", (await points(seller)) === 14);
await db.exec(`UPDATE public.profiles SET phone='07038259694' WHERE id='${stranger}'`);
await refused("same phone can't get a second MID", () => as(stranger, () => q("SELECT public.issue_my_mid()")), /One person, one MID/);
await db.exec(`UPDATE public.profiles SET phone='08051112222' WHERE id='${stranger}'`);
ok("hidden phone hides the MID from others", (await as(buyer, () => q("SELECT * FROM get_public_mid($1)", [seller])))[0].mid === null);
ok("the owner sees their own MID", (await as(seller, () => q("SELECT * FROM get_public_mid($1)", [seller])))[0].mid === mid);
await refused("users can't award themselves points", () => as(seller, () => q("SELECT public.award_mid_points($1,'clean_cycle','x')", [seller])));

// Listing + Open Inventory
let car;
await step("seller submits a listing", async () => {
  car = (await as(seller, () => q(`INSERT INTO car_listings (user_id, make, model, year, price, condition, location, listing_plan, listing_price, listing_duration, status, vin)
    VALUES ($1,'Toyota','Camry','2018',15000000,'foreign_used','Ikeja, Lagos','free',0,30,'pending_review','1hgcm82633a004352') RETURNING id, vin`, [seller])))[0];
});
ok("VIN is normalised", car?.vin === "1HGCM82633A004352", car?.vin);
await refused("seller can't approve their own listing", () => as(seller, () => q("UPDATE car_listings SET status='active' WHERE id=$1", [car.id])), /admin/);
await step("admin approves", () => as(admin, () => q("UPDATE car_listings SET status='active' WHERE id=$1", [car.id])));
await step("seller cuts the price", () => as(seller, () => q("UPDATE car_listings SET price=13500000 WHERE id=$1", [car.id])));
await step("seller confirms availability", () => as(seller, () => q("UPDATE car_listings SET availability_confirmed_at=now() WHERE id=$1", [car.id])));
await refused("VIN is locked", () => as(seller, () => q("UPDATE car_listings SET vin='2HGCM82633A004352' WHERE id=$1", [car.id])), /cannot be changed/);
await refused("second live listing with the same VIN", () => as(seller, () => q(`INSERT INTO car_listings (user_id, make, model, year, price, condition, location, listing_plan, listing_price, listing_duration, status, vin)
    VALUES ($1,'Toyota','Camry','2018',1,'foreign_used','Lagos','standard',0,30,'pending_payment','1HGCM82633A004352')`, [seller])));
const types = (await q("SELECT event_type FROM inventory_events WHERE listing_id=$1 ORDER BY id", [car.id])).map((r) => r.event_type);
ok("events recorded in order", ["submitted", "listed", "price_changed", "availability_confirmed"].every((t) => types.includes(t)), types.join());
await refused("history can't be changed", () => q("DELETE FROM inventory_events WHERE listing_id=$1", [car.id]), /cannot be changed/);
const pub = await as(buyer, () => q("SELECT * FROM get_listing_history($1)", [car.id]));
ok("buyers don't see price changes by default", !pub.some((r) => r.event_type === "price_changed") && pub.every((r) => !r.to_value?.price), JSON.stringify(pub));
ok("owner sees price changes", (await as(seller, () => q("SELECT * FROM get_listing_history($1)", [car.id]))).some((r) => r.event_type === "price_changed"));
await step("seller shows price history", () => as(seller, () => q("UPDATE profiles SET show_price_history=true WHERE id=$1", [seller])));
ok("buyers now see price changes", (await as(buyer, () => q("SELECT * FROM get_listing_history($1)", [car.id]))).some((r) => r.event_type === "price_changed"));
ok("sold count hidden from others", (await as(buyer, () => q("SELECT * FROM get_stand_inventory($1)", [seller])))[0].sold_recorded === null);

// WaveChat
const act = (u, c, a, p = {}) => as(u, () => q("SELECT public.wavechat_action($1,$2,$3::jsonb,$4) id", [c, a, JSON.stringify(p), crypto.randomUUID()]));
let conv;
await refused("can't open a chat about a car with the wrong seller", () => as(buyer, () => q("INSERT INTO conversations (listing_id,buyer_id,seller_id) VALUES ($1,$2,$3)", [car.id, buyer, stranger])), /not available/);
await step("buyer starts a chat", async () => { conv = (await as(buyer, () => q("SELECT public.start_wavechat($1) id", [car.id])))[0].id; });
await refused("seller can't chat with themselves", () => as(seller, () => q("SELECT public.start_wavechat($1)", [car.id])), /yourself/);
await refused("participants can't change a conversation's stage directly", () => as(buyer, () => q("UPDATE conversations SET stage='completed' WHERE id=$1", [conv])), /WaveChat actions/);
await refused("participants can't reassign a conversation", () => as(buyer, () => q("UPDATE conversations SET seller_id=$2 WHERE id=$1", [conv, stranger])), /WaveChat actions/);
await step("touching the timestamp still works", () => as(buyer, () => q("UPDATE conversations SET updated_at=now() WHERE id=$1", [conv])));
await step("buyer asks if available", () => act(buyer, conv, "ask_availability"));
await refused("seller can't use a buyer action", () => act(seller, conv, "ask_availability"), /Only the buyer/);
await refused("stranger can't act", () => act(stranger, conv, "ask_availability"), /not found/);
await step("seller confirms available", () => act(seller, conv, "confirm_available"));
const evt = crypto.randomUUID();
await step("same tap twice makes one message", async () => {
  await as(buyer, () => q("SELECT public.wavechat_action($1,'request_photos','{}'::jsonb,$2)", [conv, evt]));
  await as(buyer, () => q("SELECT public.wavechat_action($1,'request_photos','{}'::jsonb,$2)", [conv, evt]));
});
ok("idempotent", (await q("SELECT count(*)::int n FROM messages WHERE client_event_id=$1", [evt]))[0].n === 1);
await step("buyer books inspection", () => act(buyer, conv, "book_inspection", { proposed_at: new Date(Date.now() + 864e5).toISOString() }));
await step("seller confirms inspection", () => act(seller, conv, "confirm_inspection"));
await step("buyer offers", () => act(buyer, conv, "make_offer", { amount: 12000000 }));
const offer = (await q("SELECT id FROM messages WHERE conversation_id=$1 AND kind='offer'", [conv]))[0].id;
await step("seller declines", () => act(seller, conv, "decline_offer", { offer_id: offer }));
await refused("a declined offer can't be accepted", () => act(seller, conv, "accept_offer", { offer_id: offer }), /no longer open/);
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
await step("seller quotes", () => act(seller, conv, "send_quote", { amount: 13000000, valid_until: tomorrow, includes: ["Original papers"], note: "Final" }));
const quote = (await q("SELECT id FROM messages WHERE conversation_id=$1 AND kind='quote'", [conv]))[0].id;
await step("buyer accepts quote", () => act(buyer, conv, "accept_quote", { quote_id: quote }));
ok("stage is agreed at the quoted price", (await q("SELECT stage, agreed_price FROM conversations WHERE id=$1", [conv]))[0].stage === "agreed");
await step("buyer promises", () => act(buyer, conv, "promise_payment", { amount: 3000000, due_date: tomorrow }));
const before = await points(buyer);
await step("seller records deposit", () => act(seller, conv, "record_payment", { amount: 3000000, payment_method: "bank_transfer", kind: "deposit" }));
ok("kept promise earns the buyer +2", (await points(buyer)) === before + 2, await points(buyer));
const dep = (await q("SELECT id FROM sale_receipts WHERE conversation_id=$1", [conv]))[0].id;
await step("buyer confirms deposit receipt", () => act(buyer, conv, "confirm_receipt", { receipt_id: dep }));
await refused("receipts can't be edited", () => q("UPDATE sale_receipts SET amount=1 WHERE id=$1", [dep]), /cannot be changed/);
await step("seller starts handover", () => act(seller, conv, "start_handover"));
const items = await q("SELECT item_key FROM handover_items WHERE conversation_id=$1", [conv]);
ok("foreign-used car includes customs papers", items.some((i) => i.item_key === "customs"), items.length);
await step("seller records final payment", () => act(seller, conv, "record_sale", { amount: 10000000, payment_method: "pos" }));
const after = (await q("SELECT availability_status FROM car_listings WHERE id=$1", [car.id]))[0];
ok("car is sold", after.availability_status === "sold");
ok("stage is paid", (await q("SELECT stage FROM conversations WHERE id=$1", [conv]))[0].stage === "paid");
await refused("no more offers once paid", () => act(buyer, conv, "make_offer", { amount: 1 }), /only handover/);
await step("both sides tick every item", async () => { for (const { item_key } of items) { await act(seller, conv, "confirm_handover_item", { item: item_key }); await act(buyer, conv, "confirm_handover_item", { item: item_key }); } });
ok("stage is completed", (await q("SELECT stage FROM conversations WHERE id=$1", [conv]))[0].stage === "completed");
ok("sold count is one for the seller", (await as(seller, () => q("SELECT * FROM get_stand_inventory($1)", [seller])))[0].sold_recorded === 1);

// Chat basics
let m;
await step("plain message with attachment", async () => { m = (await as(buyer, () => q(`INSERT INTO messages (conversation_id,sender_id,content,attachment_path,attachment_type,attachment_name,attachment_size) VALUES ($1,$2,'',$3,'image','a.jpg',100) RETURNING id`, [conv, buyer, `${conv}/x-a.jpg`])))[0].id; });
await refused("attachment outside the conversation folder", () => as(buyer, () => q(`INSERT INTO messages (conversation_id,sender_id,content,attachment_path,attachment_type,attachment_size) VALUES ($1,$2,'','other/x.jpg','image',100)`, [conv, buyer])), /not valid/);
await refused("can't fake a structured message", () => as(buyer, () => q(`INSERT INTO messages (conversation_id,sender_id,content,kind) VALUES ($1,$2,'x','receipt')`, [conv, buyer])), /WaveChat actions/);
await refused("can't edit the other person's message", () => as(seller, () => q("UPDATE messages SET content='hacked' WHERE id=$1", [m])), /cannot be changed/);
await step("seller marks read", () => as(seller, () => q("SELECT public.mark_conversation_read($1)", [conv])));
ok("message shows read", (await q("SELECT is_read, read_at FROM messages WHERE id=$1", [m]))[0].is_read === true);
await step("reaction", () => as(seller, () => q("INSERT INTO message_reactions (message_id,user_id,emoji) VALUES ($1,$2,'👍')", [m, seller])));
await refused("stranger can't react", () => as(stranger, () => q("INSERT INTO message_reactions (message_id,user_id,emoji) VALUES ($1,$2,'👍')", [m, stranger])));
await step("delete for everyone", () => as(buyer, () => q("SELECT public.delete_my_message($1)", [m])));
await refused("offers can't be deleted", () => as(buyer, () => q("SELECT public.delete_my_message($1)", [offer])), /cannot be deleted/);
ok("stranger sees no messages", (await as(stranger, () => q("SELECT id FROM messages WHERE conversation_id=$1", [conv]))).length === 0);
ok("stranger sees no receipts", (await as(stranger, () => q("SELECT id FROM sale_receipts WHERE conversation_id=$1", [conv]))).length === 0);
await step("presence and unread counts run", async () => { await as(buyer, () => q("SELECT public.touch_presence()")); await as(seller, () => q("SELECT public.get_chat_partner_last_seen($1), public.count_unread_messages()", [conv])); });

// Conscience: cycles are moved through time by shifting their dates back, as the owner
const newCar = async (make, vin) => {
  const row = (await as(seller, () => q(`INSERT INTO car_listings (user_id, make, model, year, price, condition, location, listing_plan, listing_price, listing_duration, status, vin)
    VALUES ($1,$2,'Test','2019',9000000,'foreign_used','Lagos','standard',0,30,'pending_review',$3) RETURNING id`, [seller, make, vin])))[0];
  await as(admin, () => q("UPDATE car_listings SET status='active' WHERE id=$1", [row.id]));
  return row.id;
};
const cycle = async () => (await q("SELECT * FROM conscience_cycles WHERE seller_id=$1 AND status<>'sealed'", [seller]))[0];
const lastSealed = async () => (await q("SELECT * FROM conscience_cycles WHERE seller_id=$1 AND status='sealed' ORDER BY cycle_number DESC LIMIT 1", [seller]))[0];
const shift = (id, sql) => q(`UPDATE conscience_cycles SET ${sql} WHERE id=$1`, [id]);
const toDay12 = async (c) => { await new Promise((r) => setTimeout(r, 30)); await shift(c.id, "observation_ends_at=now()-interval '10 milliseconds', reconcile_ends_at=now()-interval '10 milliseconds'"); };
const toDay14 = (c) => shift(c.id, "reconcile_ends_at=now()-interval '1 minute'");
const refresh = (u = seller) => as(u, () => q("SELECT public.refresh_my_conscience()"));
const findings = (id) => q("SELECT * FROM conscience_findings WHERE cycle_id=$1 ORDER BY kind", [id]);
const confirmCar = (id) => as(seller, () => q("UPDATE car_listings SET availability_confirmed_at=now() WHERE id=$1", [id]));

const carA = await newCar("Honda", "JH4KA7650MC000001");
const carB = await newCar("Kia", "KNAFK4A63E5000002");
await step("seller's first cycle starts", () => refresh());
const c1 = await cycle();
ok("first cycle is observing, 12 + 2 days", c1?.status === "observing" && Math.round((new Date(c1.reconcile_ends_at) - new Date(c1.starts_at)) / 864e5) === 14, JSON.stringify(c1));
await step("refreshing again changes nothing", () => refresh());
ok("still one open cycle", (await q("SELECT count(*)::int n FROM conscience_cycles WHERE seller_id=$1", [seller]))[0].n === 1);
ok("sellers can't edit their cycle directly", (await as(seller, () => q("UPDATE conscience_cycles SET status='sealed', outcome='clean' WHERE id=$1 RETURNING id", [c1.id]))).length === 0);
await refused("sellers can't write findings", () => as(seller, () => q("INSERT INTO conscience_findings (cycle_id,seller_id,listing_id,car_title,kind) VALUES ($1,$2,$3,'x','not_confirmed')", [c1.id, seller, carA])));
await refused("sellers can't run every cycle", () => as(seller, () => q("SELECT public.conscience_run()")), /Only admins/);
await refused("visitors can't run every cycle", () => as(null, () => q("SELECT public.conscience_run()")));
await refused("sellers can't call the internal step", () => as(seller, () => q("SELECT public.conscience_advance($1)", [seller])));
await refused("visitors can't refresh", () => as(null, () => q("SELECT public.refresh_my_conscience()")));

// Clean cycle: both cars were listed inside the window
await shift(c1.id, "starts_at=starts_at-interval '1 hour'");
await toDay12(c1);
await step("admin runs cycles at day 12", () => as(admin, () => q("SELECT public.conscience_run()")));
const c1b = (await q("SELECT * FROM conscience_cycles WHERE id=$1", [c1.id]))[0];
ok("cycle moves to reconciling", c1b.status === "reconciling", c1b.status);
ok("a late run still leaves 48 hours", new Date(c1b.reconcile_ends_at) - Date.now() > 47 * 36e5, c1b.reconcile_ends_at);
ok("cars listed in the window need no finding", (await findings(c1.id)).length === 0);
const before1 = await points(seller);
await toDay14(c1);
await step("clean cycle seals", () => refresh());
const s1 = await lastSealed();
ok("outcome is clean", s1?.outcome === "clean", s1?.outcome);
ok("clean cycle earns 6", (await points(seller)) - before1 === 6, (await points(seller)) - before1);
await step("refreshing after sealing is harmless", () => refresh());
ok("no double award", (await points(seller)) - before1 === 6);
const c2 = await cycle();
ok("next cycle starts at once", c2?.cycle_number === 2 && c2.status === "observing", JSON.stringify(c2));
await refused("sealed cycles can't be changed, even by the database owner", () => q("UPDATE conscience_cycles SET outcome='flagged' WHERE id=$1", [c1.id]), /cannot be changed/);
await refused("cycles can't be deleted", () => q("DELETE FROM conscience_cycles WHERE id=$1", [c1.id]), /cannot be deleted/);
ok("MID ring counts the sealed cycle", Number((await as(buyer, () => q("SELECT * FROM get_public_mid($1)", [seller])))[0].cycles_sealed) === 1);

// Second clean cycle in the same month earns the bonus
await step("seller confirms both cars", async () => { await confirmCar(carA); await confirmCar(carB); });
await toDay12(c2); await refresh();
ok("confirmed cars raise no finding", (await findings(c2.id)).length === 0);
const before2 = await points(seller);
await toDay14(c2); await refresh();
ok("two clean cycles in a month earn 6 + 8", (await points(seller)) - before2 === 14, (await points(seller)) - before2);

// Forgotten confirmations: first put right in time, then ignored
const c3 = await cycle();
await toDay12(c3); await refresh();
const f3 = await findings(c3.id);
ok("both unconfirmed cars are found", f3.length === 2 && f3.every((f) => f.kind === "not_confirmed" && f.status === "open"), JSON.stringify(f3));
ok("seller sees their own findings", (await as(seller, () => q("SELECT id FROM conscience_findings WHERE cycle_id=$1", [c3.id]))).length === 2);
ok("others can't see findings", (await as(buyer, () => q("SELECT id FROM conscience_findings WHERE cycle_id=$1", [c3.id]))).length === 0);
ok("seller is told", (await q("SELECT count(*)::int n FROM notifications WHERE user_id=$1 AND title LIKE '%needs attention%'", [seller]))[0].n === 1);
await step("seller reconciles both cars in the window", async () => { await confirmCar(carA); await confirmCar(carB); });
await refresh();
ok("a fix shows straight away, before the window ends", (await findings(c3.id)).every((f) => f.status === "reconciled"));
ok("the cycle waits for its 48 hours", (await q("SELECT status FROM conscience_cycles WHERE id=$1", [c3.id]))[0].status === "reconciling");
const before3 = await points(seller);
await toDay14(c3); await refresh();
ok("reconciled in time is still clean", (await lastSealed()).outcome === "clean", (await lastSealed()).outcome);
ok("findings close as reconciled", (await findings(c3.id)).every((f) => f.status === "reconciled"));
ok("third clean cycle earns 6, month bonus only once", (await points(seller)) - before3 === 6, (await points(seller)) - before3);
await refused("sealed findings can't be changed", () => q("UPDATE conscience_findings SET status='open' WHERE cycle_id=$1", [c3.id]), /cannot be changed/);

const c4 = await cycle();
await toDay12(c4); await refresh();
const before4 = await points(seller);
await toDay14(c4); await refresh();
ok("ignored confirmations flag the cycle", (await lastSealed()).outcome === "flagged");
ok("two forgotten cars cost -6 once, not per car", (await points(seller)) - before4 === -6, (await points(seller)) - before4);

// Contradictions: said gone in chat, and took a deposit, with the cars still listed available
const conv2 = (await as(buyer, () => q("SELECT public.start_wavechat($1) id", [carA])))[0].id;
const conv3 = (await as(buyer, () => q("SELECT public.start_wavechat($1) id", [carB])))[0].id;
await step("seller says car A is gone in chat", () => act(seller, conv2, "reply_not_available"));
await step("seller takes a deposit on car B", () => act(seller, conv3, "record_payment", { amount: 500000, payment_method: "cash" }));
await step("seller confirms car B", () => confirmCar(carB));
const c5 = await cycle();
await toDay12(c5); await refresh();
const f5 = await findings(c5.id);
ok("chat contradiction is found", f5.some((f) => f.kind === "chat_says_unavailable" && f.listing_id === carA), JSON.stringify(f5.map((f) => f.kind)));
ok("a deposit isn't cleared by confirming", f5.some((f) => f.kind === "paid_still_available" && f.listing_id === carB), JSON.stringify(f5.map((f) => f.kind)));
await step("seller reserves car B", () => as(seller, () => q("UPDATE car_listings SET availability_status='reserved' WHERE id=$1", [carB])));
const before5 = await points(seller);
await toDay14(c5); await refresh();
const f5b = await findings(c5.id);
ok("reserved car is reconciled", f5b.find((f) => f.kind === "paid_still_available")?.status === "reconciled");
ok("chat contradiction stays unreconciled", f5b.find((f) => f.kind === "chat_says_unavailable")?.status === "unreconciled");
ok("the contradiction costs -6, and car A's missed confirmation -6 more", Math.round((await points(seller)) - before5) === -12, (await points(seller)) - before5);
ok("cycle is flagged", (await lastSealed()).outcome === "flagged");

// An upheld report
const report = async (reason) => (await as(buyer, () => q("INSERT INTO listing_reports (listing_id, reporter_id, reason) VALUES ($1,$2,$3) RETURNING id", [carA, buyer, reason])))[0].id;
const rWrong = await report("wrong_details");
await refused("only an admin can uphold", () => as(seller, () => q("SELECT public.conscience_uphold_report($1,'x')", [rWrong])), /Only admins/);
await refused("only sold-or-unavailable reports count", () => as(admin, () => q("SELECT public.conscience_uphold_report($1,'x')", [rWrong])), /Only a report/);
await q("UPDATE listing_reports SET status='dismissed' WHERE id=$1", [rWrong]);
const rSold = await report("sold_or_unavailable");
await refused("an evidence note is required", () => as(admin, () => q("SELECT public.conscience_uphold_report($1,'  ')", [rSold])), /evidence/);
await step("admin upholds the report", () => as(admin, () => q("SELECT public.conscience_uphold_report($1,'Buyer sent the sale photo')", [rSold])));
ok("report is resolved", (await q("SELECT status FROM listing_reports WHERE id=$1", [rSold]))[0].status === "resolved");
const c6 = await cycle();
ok("the lie is on the open cycle", (await findings(c6.id)).some((f) => f.kind === "availability_lie" && f.status === "upheld"));
await step("seller marks the car sold", () => as(seller, () => q("UPDATE car_listings SET availability_status='sold' WHERE id=$1", [carA])));
await step("seller confirms car B", () => confirmCar(carB));
await toDay12(c6); await refresh();
const before6 = await points(seller);
await toDay14(c6); await refresh();
ok("an upheld lie still costs -8 after the car is fixed", (await points(seller)) - before6 === -8, (await points(seller)) - before6);
ok("a cycle with a lie is flagged", (await lastSealed()).outcome === "flagged");

const pubC = (await as(null, () => q("SELECT * FROM get_public_conscience($1)", [seller])))[0];
ok("public record shows sealed and clean counts", pubC.cycles_sealed === 6 && pubC.clean_cycles === 3, JSON.stringify(pubC));
await step("turning Conscience off pauses it", async () => { await as(admin, () => q("UPDATE platform_features SET mode='preview' WHERE feature='conscience'")); await refresh(); });
ok("public record is hidden while off", (await as(null, () => q("SELECT * FROM get_public_conscience($1)", [seller]))).length === 0);
await as(admin, () => q("UPDATE platform_features SET mode='motorcars' WHERE feature='conscience'"));

// Argus: the gate and the usage record belong to the server function alone
const asService = async (fn) => { await db.exec("SET ROLE service_role"); try { return await fn(); } finally { await db.exec("RESET ROLE"); } };
const gate = async (u = buyer) => (await asService(() => q("SELECT public.argus_gate($1) g", [u])))[0].g;
const spend = (u, cost, outcome = "answered") => asService(() => q("SELECT public.argus_record_usage($1,'search','claude-opus-5-5',100,10,$2,$3)", [u, cost, outcome]));
ok("nothing is spent until a cap is set", (await gate()) === "budget", await gate());
await refused("users can't check the gate", () => as(buyer, () => q("SELECT public.argus_gate($1)", [buyer])));
await refused("users can't record usage", () => as(buyer, () => q("SELECT public.argus_record_usage($1,'search','m',1,1,0,'answered')", [buyer])));
ok("users can't raise the cap", (await as(buyer, () => q("UPDATE argus_settings SET monthly_cap_usd=1000 RETURNING id"))).length === 0);
await refused("users can't see spending", () => as(buyer, () => q("SELECT * FROM get_argus_budget()")), /Only admins/);
ok("users can't read usage", (await as(buyer, () => q("SELECT id FROM argus_usage"))).length === 0);
await step("admin sets a cap", () => as(admin, () => q("UPDATE argus_settings SET monthly_cap_usd=1, daily_questions_per_user=2")));
ok("under the cap Claude may be used", (await gate()) === "ok", await gate());
await step("two questions are recorded, one failed", async () => { await spend(buyer, 0.1); await spend(buyer, 0.1, "failed"); });
ok("failed questions count towards the daily limit", (await gate()) === "daily_limit", await gate());
ok("someone else can still ask", (await gate(stranger)) === "ok");
await spend(stranger, 0.8);
ok("at the cap everyone stops", (await gate(stranger)) === "budget" && (await gate(admin)) === "budget");
const budget = (await as(admin, () => q("SELECT * FROM get_argus_budget()")))[0];
ok("admin sees the month's spending", Number(budget.spent_this_month_usd) === 1 && budget.questions_this_month === 3, JSON.stringify(budget));
ok("no question text is stored", !(await q("SELECT column_name FROM information_schema.columns WHERE table_name='argus_usage'")).some((c) => /question|prompt|content/.test(c.column_name)));
await as(admin, () => q("UPDATE platform_features SET mode='preview' WHERE feature='argus'"));
ok("switched off, Claude is never called", (await gate(stranger)) === "off");
await as(admin, () => q("UPDATE platform_features SET mode='motorcars' WHERE feature='argus'"));

console.log(`\n${pass} passed, ${fail} failed`);
