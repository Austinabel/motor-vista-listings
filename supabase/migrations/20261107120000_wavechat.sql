-- WaveChat, interim Motorcars version.
-- Requires, in order: 20261021120000_security_hardening.sql, 20261029120000_listing_lifecycle.sql,
-- 20261105120000_platform_features_and_mid.sql, 20261106120000_open_inventory.sql.
--
-- Builds on the existing conversations/messages tables, so every past conversation carries over.
-- * Conversations gain a stage (enquiry → inspection → offer → agreed → completed).
-- * Messages gain a kind and a payload for structured actions. Structured actions run only through
--   wavechat_action(), which checks who may do what at which stage (Moatwave PRD Section 12: chat
--   becomes structured commercial events). An agreed offer is never a sale or a payment.
-- * Recording a sale issues a first-class receipt (sale_receipts), marks the car sold (recorded by
--   Open Inventory) and lets the buyer confirm it, linking receipt ↔ conversation ↔ car ↔ both people.
-- * Every action accepts a client-generated event id, so a retried tap never duplicates.
-- * Closes two gaps in the original chat rules: a conversation could be opened with anyone about any
--   car, and either person could edit the other's messages.
-- Reverse with supabase/rollback/20261107120000_wavechat_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'enquiry',
  ADD COLUMN IF NOT EXISTS inspection_at timestamptz,
  ADD COLUMN IF NOT EXISTS inspection_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreed_price numeric;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_stage_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_stage_check
  CHECK (stage IN ('enquiry', 'inspection', 'offer', 'agreed', 'completed', 'closed'));

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS action text,
  ADD COLUMN IF NOT EXISTS payload jsonb,
  ADD COLUMN IF NOT EXISTS client_event_id uuid;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_kind_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_kind_check
  CHECK (kind IN ('text', 'action', 'offer', 'offer_response', 'receipt'));
CREATE UNIQUE INDEX IF NOT EXISTS messages_client_event_id ON public.messages (client_event_id) WHERE client_event_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Receipts
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.sale_receipt_number_seq;

CREATE TABLE IF NOT EXISTS public.sale_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE,
  conversation_id uuid NOT NULL REFERENCES public.conversations (id),
  listing_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  car_title text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'pos', 'ussd', 'other')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  buyer_confirmed_at timestamptz,
  synced_to_moatwave_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS sale_receipts_one_per_conversation ON public.sale_receipts (conversation_id);

ALTER TABLE public.sale_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer and seller read their receipts" ON public.sale_receipts;
CREATE POLICY "Buyer and seller read their receipts" ON public.sale_receipts
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id) OR public.is_admin());
-- No write policies: receipts are issued and confirmed only through wavechat_action.

-- ---------------------------------------------------------------------------
-- 3. Guards on the original tables
-- ---------------------------------------------------------------------------
-- Reads what the guard below needs but the caller's row-level access may hide.
CREATE OR REPLACE FUNCTION public.listing_open_for_chat(_listing_id uuid, _seller_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.car_listings
                 WHERE id = _listing_id AND user_id = _seller_id AND status = 'active')
$$;

CREATE OR REPLACE FUNCTION public.seller_accepts_messages(_seller_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _seller_id AND allow_messages = false)
$$;

-- A conversation is between a buyer and the seller of a live listing that accepts messages.
-- Must NOT be SECURITY DEFINER: is_restricted_api_caller() reads current_user, which would then be
-- the function owner, and every check here would be skipped.
CREATE OR REPLACE FUNCTION public.guard_conversation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_restricted_api_caller() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.buyer_id = NEW.seller_id THEN
      RAISE EXCEPTION 'You cannot message yourself';
    END IF;
    IF NOT public.listing_open_for_chat(NEW.listing_id, NEW.seller_id) THEN
      RAISE EXCEPTION 'This listing is not available for messages';
    END IF;
    IF NOT public.seller_accepts_messages(NEW.seller_id) THEN
      RAISE EXCEPTION 'This seller has turned off messages';
    END IF;
    NEW.stage := 'enquiry';
    NEW.inspection_at := NULL;
    NEW.inspection_confirmed := false;
    NEW.agreed_price := NULL;
    RETURN NEW;
  END IF;

  -- UPDATE: participants may only touch the timestamp; everything else changes through wavechat_action
  IF NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.stage IS DISTINCT FROM OLD.stage
     OR NEW.inspection_at IS DISTINCT FROM OLD.inspection_at
     OR NEW.inspection_confirmed IS DISTINCT FROM OLD.inspection_confirmed
     OR NEW.agreed_price IS DISTINCT FROM OLD.agreed_price THEN
    RAISE EXCEPTION 'This conversation can only be changed through WaveChat actions';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_guard_conversation ON public.conversations;
CREATE TRIGGER a_guard_conversation
  BEFORE INSERT OR UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.guard_conversation();

-- People type plain text; structured messages come only from wavechat_action. The only change
-- anyone may make to a sent message is the recipient marking it read.
CREATE OR REPLACE FUNCTION public.guard_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_restricted_api_caller() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.kind <> 'text' OR NEW.action IS NOT NULL OR NEW.payload IS NOT NULL THEN
      RAISE EXCEPTION 'Structured messages are sent through WaveChat actions';
    END IF;
    IF length(btrim(NEW.content)) = 0 OR length(NEW.content) > 2000 THEN
      RAISE EXCEPTION 'Messages must be between 1 and 2000 characters';
    END IF;
    NEW.is_read := false;
    NEW.created_at := now();
    RETURN NEW;
  END IF;

  IF NEW.sender_id = auth.uid()
     OR NEW.is_read IS NOT TRUE
     OR (to_jsonb(NEW) - 'is_read') <> (to_jsonb(OLD) - 'is_read') THEN
    RAISE EXCEPTION 'Sent messages cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_guard_message ON public.messages;
CREATE TRIGGER a_guard_message
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.guard_message();

-- ---------------------------------------------------------------------------
-- 4. Starting a conversation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_wavechat(_listing_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  me uuid := auth.uid();
  seller uuid;
  conversation uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Sign in to message the seller'; END IF;
  IF public.feature_mode('wavechat') <> 'motorcars' THEN RAISE EXCEPTION 'WaveChat is not available yet'; END IF;

  SELECT user_id INTO seller FROM public.car_listings WHERE id = _listing_id AND status = 'active';
  IF seller IS NULL THEN RAISE EXCEPTION 'This listing is not available for messages'; END IF;
  IF seller = me THEN RAISE EXCEPTION 'You cannot message yourself'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = seller AND allow_messages = false) THEN
    RAISE EXCEPTION 'This seller has turned off messages';
  END IF;

  SELECT id INTO conversation FROM public.conversations
  WHERE listing_id = _listing_id AND buyer_id = me AND seller_id = seller;
  IF conversation IS NULL THEN
    INSERT INTO public.conversations (listing_id, buyer_id, seller_id)
    VALUES (_listing_id, me, seller) RETURNING id INTO conversation;
  END IF;
  RETURN conversation;
END;
$$;
REVOKE ALL ON FUNCTION public.start_wavechat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_wavechat(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Structured actions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.naira(_amount numeric)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$ SELECT '₦' || to_char(_amount, 'FM999,999,999,990') $$;

CREATE OR REPLACE FUNCTION public.wavechat_action(
  _conversation_id uuid,
  _action text,
  _payload jsonb DEFAULT '{}'::jsonb,
  _client_event_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  me uuid := auth.uid();
  c public.conversations%ROWTYPE;
  l public.car_listings%ROWTYPE;
  who text;
  existing uuid;
  msg_id uuid;
  amount numeric;
  offer public.messages%ROWTYPE;
  when_at timestamptz;
  method text;
  receipt public.sale_receipts%ROWTYPE;
  body text;
  msg_kind text := 'action';
  msg_payload jsonb;
  new_stage text;
  title text;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Sign in to use WaveChat'; END IF;
  IF public.feature_mode('wavechat') <> 'motorcars' THEN RAISE EXCEPTION 'WaveChat is not available yet'; END IF;

  -- A retried tap returns the message it already created
  IF _client_event_id IS NOT NULL THEN
    SELECT id INTO existing FROM public.messages WHERE client_event_id = _client_event_id;
    IF existing IS NOT NULL THEN RETURN existing; END IF;
  END IF;

  SELECT * INTO c FROM public.conversations WHERE id = _conversation_id FOR UPDATE;
  IF NOT FOUND OR me NOT IN (c.buyer_id, c.seller_id) THEN RAISE EXCEPTION 'Conversation not found'; END IF;
  who := CASE WHEN me = c.seller_id THEN 'seller' ELSE 'buyer' END;
  new_stage := c.stage;

  SELECT * INTO l FROM public.car_listings WHERE id = c.listing_id;
  title := concat_ws(' ', l.year, l.make, l.model);

  IF c.stage IN ('completed', 'closed') AND _action <> 'confirm_receipt' THEN
    RAISE EXCEPTION 'This conversation has ended';
  END IF;

  IF _action IN ('ask_availability', 'request_photos', 'book_inspection', 'make_offer', 'withdraw_offer', 'confirm_receipt')
     AND who <> 'buyer' THEN
    RAISE EXCEPTION 'Only the buyer can do that';
  END IF;
  IF _action IN ('confirm_available', 'reply_not_available', 'confirm_inspection', 'accept_offer', 'decline_offer', 'record_sale')
     AND who <> 'seller' THEN
    RAISE EXCEPTION 'Only the seller can do that';
  END IF;

  IF _action = 'ask_availability' THEN
    body := 'Is this car still available?';

  ELSIF _action = 'confirm_available' THEN
    IF l.availability_status <> 'available' THEN
      RAISE EXCEPTION 'This car is not marked available. Update its status first.';
    END IF;
    -- Answering in chat also confirms availability on the listing (recorded by Open Inventory)
    UPDATE public.car_listings SET availability_confirmed_at = now() WHERE id = l.id;
    body := 'Yes, it''s still available.';

  ELSIF _action = 'reply_not_available' THEN
    body := 'Sorry, this car is no longer available.';

  ELSIF _action = 'request_photos' THEN
    body := 'Could you send more photos, including the engine bay, the interior and any damage?';

  ELSIF _action = 'book_inspection' THEN
    when_at := (_payload ->> 'proposed_at')::timestamptz;
    IF when_at IS NULL OR when_at < now() THEN RAISE EXCEPTION 'Choose a time in the future for the inspection'; END IF;
    UPDATE public.conversations SET inspection_at = when_at, inspection_confirmed = false WHERE id = c.id;
    body := 'I''d like to inspect the car on ' || to_char(when_at AT TIME ZONE 'Africa/Lagos', 'FMDay DD Mon, HH12:MI AM') || '.';
    msg_payload := jsonb_build_object('proposed_at', when_at);
    IF c.stage = 'enquiry' THEN new_stage := 'inspection'; END IF;

  ELSIF _action = 'confirm_inspection' THEN
    IF c.inspection_at IS NULL THEN RAISE EXCEPTION 'The buyer has not asked for an inspection yet'; END IF;
    UPDATE public.conversations SET inspection_confirmed = true WHERE id = c.id;
    body := 'Inspection confirmed for ' || to_char(c.inspection_at AT TIME ZONE 'Africa/Lagos', 'FMDay DD Mon, HH12:MI AM') || '.';
    msg_payload := jsonb_build_object('inspection_at', c.inspection_at);

  ELSIF _action = 'make_offer' THEN
    amount := round((_payload ->> 'amount')::numeric);
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter an offer above zero'; END IF;
    -- A new offer replaces any offer still waiting for an answer
    UPDATE public.messages SET payload = payload || '{"status":"replaced"}'
    WHERE conversation_id = c.id AND kind = 'offer' AND payload ->> 'status' = 'pending';
    msg_kind := 'offer';
    msg_payload := jsonb_build_object('amount', amount, 'status', 'pending');
    body := 'Offer: ' || public.naira(amount) || '. An offer in chat is not a sale or a payment.';
    IF c.stage IN ('enquiry', 'inspection') THEN new_stage := 'offer'; END IF;

  ELSIF _action IN ('accept_offer', 'decline_offer', 'withdraw_offer') THEN
    SELECT * INTO offer FROM public.messages
    WHERE id = (_payload ->> 'offer_id')::uuid AND conversation_id = c.id AND kind = 'offer' FOR UPDATE;
    IF NOT FOUND OR offer.payload ->> 'status' <> 'pending' THEN
      RAISE EXCEPTION 'That offer is no longer open';
    END IF;
    amount := (offer.payload ->> 'amount')::numeric;
    UPDATE public.messages
    SET payload = payload || jsonb_build_object('status',
      CASE _action WHEN 'accept_offer' THEN 'accepted' WHEN 'decline_offer' THEN 'declined' ELSE 'withdrawn' END)
    WHERE id = offer.id;
    msg_kind := 'offer_response';
    msg_payload := jsonb_build_object('offer_id', offer.id, 'amount', amount);
    IF _action = 'accept_offer' THEN
      UPDATE public.conversations SET agreed_price = amount WHERE id = c.id;
      new_stage := 'agreed';
      body := 'Offer of ' || public.naira(amount) || ' accepted. This is an agreement in chat, not a sale or a payment.';
    ELSIF _action = 'decline_offer' THEN
      body := 'Offer of ' || public.naira(amount) || ' declined.';
    ELSE
      body := 'Offer of ' || public.naira(amount) || ' withdrawn.';
    END IF;

  ELSIF _action = 'record_sale' THEN
    amount := round((_payload ->> 'amount')::numeric);
    method := _payload ->> 'payment_method';
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter the amount paid'; END IF;
    IF method IS NULL OR method NOT IN ('cash', 'bank_transfer', 'pos', 'ussd', 'other') THEN
      RAISE EXCEPTION 'Choose how the buyer paid';
    END IF;
    IF l.availability_status = 'sold' THEN RAISE EXCEPTION 'This car is already marked sold'; END IF;

    INSERT INTO public.sale_receipts (receipt_number, conversation_id, listing_id, buyer_id, seller_id, car_title, amount, payment_method)
    VALUES ('MC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.sale_receipt_number_seq')::text, 6, '0'),
            c.id, l.id, c.buyer_id, c.seller_id, title, amount, method)
    RETURNING * INTO receipt;

    -- The car is sold: Open Inventory records it and the seller's MID gets the sale points
    UPDATE public.car_listings SET availability_status = 'sold' WHERE id = l.id;
    PERFORM public.award_mid_points(c.seller_id, 'receipt_sent', 'receipt_sent:' || receipt.id, 'sale_receipts:' || receipt.id);

    msg_kind := 'receipt';
    msg_payload := jsonb_build_object('receipt_id', receipt.id, 'receipt_number', receipt.receipt_number, 'amount', amount, 'payment_method', method);
    body := 'Sale recorded: ' || public.naira(amount) || '. Receipt ' || receipt.receipt_number || '.';
    new_stage := 'completed';

  ELSIF _action = 'confirm_receipt' THEN
    UPDATE public.sale_receipts SET buyer_confirmed_at = now()
    WHERE conversation_id = c.id AND buyer_id = me AND buyer_confirmed_at IS NULL
    RETURNING * INTO receipt;
    IF receipt.id IS NULL THEN RAISE EXCEPTION 'There is no receipt to confirm'; END IF;
    msg_payload := jsonb_build_object('receipt_id', receipt.id);
    body := 'I confirm receipt ' || receipt.receipt_number || ' is correct.';

  ELSE
    RAISE EXCEPTION 'Unknown WaveChat action %', _action;
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, content, kind, action, payload, client_event_id)
  VALUES (c.id, me, body, msg_kind, _action, msg_payload, _client_event_id)
  RETURNING id INTO msg_id;

  UPDATE public.conversations SET stage = new_stage, updated_at = now() WHERE id = c.id;
  RETURN msg_id;
END;
$$;
REVOKE ALL ON FUNCTION public.wavechat_action(uuid, text, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wavechat_action(uuid, text, jsonb, uuid) TO authenticated;

-- Receipts stay as issued; only the buyer's confirmation (set above) and the Moatwave sync mark change.
CREATE OR REPLACE FUNCTION public.keep_sale_receipts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'buyer_confirmed_at' - 'synced_to_moatwave_at')
       = (to_jsonb(OLD) - 'buyer_confirmed_at' - 'synced_to_moatwave_at')
     AND (OLD.buyer_confirmed_at IS NULL OR NEW.buyer_confirmed_at = OLD.buyer_confirmed_at) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Receipts cannot be changed or deleted';
END;
$$;

DROP TRIGGER IF EXISTS keep_sale_receipts ON public.sale_receipts;
CREATE TRIGGER keep_sale_receipts
  BEFORE UPDATE OR DELETE ON public.sale_receipts
  FOR EACH ROW EXECUTE FUNCTION public.keep_sale_receipts();

-- The Motorcars version of WaveChat now exists, so admins may switch it on
CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio', 'wavechat') $$;

COMMIT;
