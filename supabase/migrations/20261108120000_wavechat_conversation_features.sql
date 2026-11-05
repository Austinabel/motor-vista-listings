-- WaveChat: everyday chat features and the WaveChat sales records.
-- Requires 20261107120000_wavechat.sql (and everything it requires).
--
-- Chat: photo, document and voice-note attachments (private bucket, only the two people in the
-- conversation can open them), replies, one reaction per person per message, delete-for-everyone
-- for your own plain messages, delivered/read times, last seen, unread counts.
-- Sales records (Moatwave PRD Sections 12, 14.4, 22): seller quotes, deposit and part-payment
-- receipts, buyer payment promises with due dates (kept on time earns MID points), and a handover
-- checklist both sides confirm. Recording the final payment no longer ends the conversation:
-- the stages now run enquiry → inspection → offer → agreed → paid → completed (handed over).
-- Structured records (offers, quotes, receipts, promises, handover) can never be deleted.
-- Reverse with supabase/rollback/20261108120000_wavechat_conversation_features_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Stages and message kinds
-- ---------------------------------------------------------------------------
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_stage_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_stage_check
  CHECK (stage IN ('enquiry', 'inspection', 'offer', 'agreed', 'paid', 'completed', 'closed'));
-- Conversations completed under the earlier rule had their final payment recorded
UPDATE public.conversations SET stage = 'paid' WHERE stage = 'completed';

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_kind_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_kind_check
  CHECK (kind IN ('text', 'action', 'offer', 'offer_response', 'quote', 'quote_response', 'payment', 'promise', 'receipt', 'handover'));

-- ---------------------------------------------------------------------------
-- 2. Message columns: replies, attachments, delivery, deletion
-- ---------------------------------------------------------------------------
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attachment_path text,
  ADD COLUMN IF NOT EXISTS attachment_type text,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_size integer,
  ADD COLUMN IF NOT EXISTS attachment_duration integer,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_attachment_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_attachment_type_check
  CHECK (attachment_type IS NULL OR attachment_type IN ('image', 'file', 'voice'));
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages (conversation_id) WHERE is_read = false;

-- Plain messages may carry an attachment instead of words. Replies stay inside their conversation.
-- The only direct change to a sent message is the recipient marking it delivered or read.
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
    IF NEW.attachment_path IS NOT NULL THEN
      IF NEW.attachment_path NOT LIKE NEW.conversation_id::text || '/%'
         OR NEW.attachment_type IS NULL
         OR coalesce(NEW.attachment_size, 0) NOT BETWEEN 1 AND 10485760
         OR length(coalesce(NEW.attachment_name, '')) > 200 THEN
        RAISE EXCEPTION 'That attachment is not valid';
      END IF;
    ELSIF length(btrim(NEW.content)) = 0 THEN
      RAISE EXCEPTION 'Messages cannot be empty';
    END IF;
    IF length(NEW.content) > 2000 THEN RAISE EXCEPTION 'Messages can be up to 2000 characters'; END IF;
    IF NEW.reply_to_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.messages WHERE id = NEW.reply_to_id AND conversation_id = NEW.conversation_id) THEN
      RAISE EXCEPTION 'You can only reply to a message in this conversation';
    END IF;
    NEW.is_read := false;
    NEW.created_at := now();
    NEW.delivered_at := NULL;
    NEW.read_at := NULL;
    NEW.deleted_at := NULL;
    RETURN NEW;
  END IF;

  IF NEW.sender_id = auth.uid()
     OR (to_jsonb(NEW) - 'is_read' - 'read_at' - 'delivered_at') <> (to_jsonb(OLD) - 'is_read' - 'read_at' - 'delivered_at')
     OR (OLD.is_read AND NOT NEW.is_read) THEN
    RAISE EXCEPTION 'Sent messages cannot be changed';
  END IF;
  IF NEW.is_read AND NOT OLD.is_read THEN
    NEW.read_at := coalesce(OLD.read_at, now());
  END IF;
  IF NEW.is_read OR NEW.delivered_at IS NOT NULL THEN
    NEW.delivered_at := coalesce(OLD.delivered_at, now());
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_chat_participant(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations
                 WHERE id = _conversation_id AND auth.uid() IN (buyer_id, seller_id))
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_delivered(_conversation_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.messages SET delivered_at = now()
  WHERE conversation_id = _conversation_id AND sender_id <> auth.uid() AND delivered_at IS NULL
    AND public.is_chat_participant(_conversation_id)
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.messages
  SET is_read = true, read_at = coalesce(read_at, now()), delivered_at = coalesce(delivered_at, now())
  WHERE conversation_id = _conversation_id AND sender_id <> auth.uid() AND NOT is_read
    AND public.is_chat_participant(_conversation_id)
$$;

CREATE OR REPLACE FUNCTION public.count_unread_messages()
RETURNS integer
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)::int FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE auth.uid() IN (c.buyer_id, c.seller_id) AND m.sender_id <> auth.uid()
    AND NOT m.is_read AND m.deleted_at IS NULL
$$;

-- Delete for everyone: your own plain messages only. Returns the attachment path, if any,
-- so the app can remove the file. Offers, quotes, receipts, promises and handover stay.
CREATE OR REPLACE FUNCTION public.delete_my_message(_message_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  m public.messages%ROWTYPE;
BEGIN
  SELECT * INTO m FROM public.messages WHERE id = _message_id FOR UPDATE;
  IF NOT FOUND OR m.sender_id <> auth.uid() THEN RAISE EXCEPTION 'You can only delete your own messages'; END IF;
  IF m.kind <> 'text' THEN RAISE EXCEPTION 'Offers, quotes, receipts and handover records cannot be deleted'; END IF;
  IF m.deleted_at IS NOT NULL THEN RETURN NULL; END IF;
  UPDATE public.messages
  SET content = '', deleted_at = now(), attachment_path = NULL, attachment_type = NULL,
      attachment_name = NULL, attachment_size = NULL, attachment_duration = NULL
  WHERE id = _message_id;
  RETURN m.attachment_path;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_delivered(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.count_unread_messages() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_my_message(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_conversation_delivered(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_unread_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_my_message(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Reactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id uuid NOT NULL REFERENCES public.messages (id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '😮', '🙏', '👎')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants see reactions" ON public.message_reactions;
CREATE POLICY "Participants see reactions" ON public.message_reactions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.is_chat_participant(m.conversation_id)));
DROP POLICY IF EXISTS "Participants react" ON public.message_reactions;
CREATE POLICY "Participants react" ON public.message_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND m.deleted_at IS NULL AND public.is_chat_participant(m.conversation_id)));
DROP POLICY IF EXISTS "People change their own reaction" ON public.message_reactions;
CREATE POLICY "People change their own reaction" ON public.message_reactions
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "People remove their own reaction" ON public.message_reactions;
CREATE POLICY "People remove their own reaction" ON public.message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Last seen
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
-- No policies: read and written only through the two functions below.

CREATE OR REPLACE FUNCTION public.touch_presence()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.user_presence (user_id, last_seen_at) VALUES (auth.uid(), now())
  ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now()
$$;

-- Only the other person in a conversation can see when you were last active.
CREATE OR REPLACE FUNCTION public.get_chat_partner_last_seen(_conversation_id uuid)
RETURNS timestamptz
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.last_seen_at FROM public.conversations c
  JOIN public.user_presence p ON p.user_id = CASE WHEN c.buyer_id = auth.uid() THEN c.seller_id ELSE c.buyer_id END
  WHERE c.id = _conversation_id AND auth.uid() IN (c.buyer_id, c.seller_id)
$$;

REVOKE ALL ON FUNCTION public.touch_presence() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_chat_partner_last_seen(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_presence() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_partner_last_seen(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Attachments: a private bucket, one folder per conversation
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wavechat', 'wavechat', false, 10485760, ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac'
])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "WaveChat participants read attachments" ON storage.objects;
CREATE POLICY "WaveChat participants read attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'wavechat' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1] AND auth.uid() IN (c.buyer_id, c.seller_id)));

DROP POLICY IF EXISTS "WaveChat participants upload attachments" ON storage.objects;
CREATE POLICY "WaveChat participants upload attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wavechat' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1] AND auth.uid() IN (c.buyer_id, c.seller_id)));

DROP POLICY IF EXISTS "WaveChat senders remove their attachments" ON storage.objects;
CREATE POLICY "WaveChat senders remove their attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'wavechat' AND owner = auth.uid());

-- ---------------------------------------------------------------------------
-- 6. Receipts for every payment, payment promises, handover
-- ---------------------------------------------------------------------------
ALTER TABLE public.sale_receipts ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'final';
ALTER TABLE public.sale_receipts DROP CONSTRAINT IF EXISTS sale_receipts_kind_check;
ALTER TABLE public.sale_receipts ADD CONSTRAINT sale_receipts_kind_check CHECK (kind IN ('deposit', 'part_payment', 'final'));
DROP INDEX IF EXISTS public.sale_receipts_one_per_conversation;
CREATE UNIQUE INDEX IF NOT EXISTS sale_receipts_one_final_per_conversation ON public.sale_receipts (conversation_id) WHERE kind = 'final';

CREATE TABLE IF NOT EXISTS public.payment_promises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  kept_at timestamptz,
  kept_on_time boolean,
  cancelled_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_payment_promises_conversation ON public.payment_promises (conversation_id);

ALTER TABLE public.payment_promises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer and seller read promises" ON public.payment_promises;
CREATE POLICY "Buyer and seller read promises" ON public.payment_promises
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id) OR public.is_admin());
-- No write policies: promises change only through wavechat_action.

CREATE TABLE IF NOT EXISTS public.handover_items (
  conversation_id uuid NOT NULL REFERENCES public.conversations (id),
  item_key text NOT NULL,
  label text NOT NULL,
  position integer NOT NULL,
  seller_confirmed_at timestamptz,
  buyer_confirmed_at timestamptz,
  PRIMARY KEY (conversation_id, item_key)
);

ALTER TABLE public.handover_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyer and seller read handover" ON public.handover_items;
CREATE POLICY "Buyer and seller read handover" ON public.handover_items
  FOR SELECT USING (public.is_chat_participant(conversation_id) OR public.is_admin());
-- No write policies: handover changes only through wavechat_action.

-- Keeping a payment promise on time earns the buyer MID points (PRD: debtor resolved within promise +2)
INSERT INTO public.mid_point_rules (version_id, event_type, points, label)
SELECT id, 'payment_promise_kept', 2, 'Payment promise kept on time'
FROM public.score_config_versions WHERE is_active
ON CONFLICT (version_id, event_type) DO NOTHING;

-- Marks open promises as kept once enough has been paid since each was made.
CREATE OR REPLACE FUNCTION public.settle_payment_promises(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  p public.payment_promises%ROWTYPE;
  paid numeric;
  on_time boolean;
BEGIN
  FOR p IN SELECT * FROM public.payment_promises
           WHERE conversation_id = _conversation_id AND kept_at IS NULL AND cancelled_at IS NULL LOOP
    SELECT coalesce(sum(amount), 0) INTO paid FROM public.sale_receipts
    WHERE conversation_id = _conversation_id AND issued_at >= p.created_at;
    IF paid >= p.amount THEN
      on_time := (now() AT TIME ZONE 'Africa/Lagos')::date <= p.due_date;
      UPDATE public.payment_promises SET kept_at = now(), kept_on_time = on_time WHERE id = p.id;
      IF on_time THEN
        PERFORM public.award_mid_points(p.buyer_id, 'payment_promise_kept', 'payment_promise_kept:' || p.id, 'payment_promises:' || p.id);
      END IF;
    END IF;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_payment_promises(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Structured actions (replaces the earlier version, keeping its actions)
-- ---------------------------------------------------------------------------
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
  today date := (now() AT TIME ZONE 'Africa/Lagos')::date;
  c public.conversations%ROWTYPE;
  l public.car_listings%ROWTYPE;
  who text;
  existing uuid;
  msg_id uuid;
  amount numeric;
  ref public.messages%ROWTYPE;
  when_at timestamptz;
  due date;
  method text;
  receipt_kind text;
  receipt public.sale_receipts%ROWTYPE;
  promise public.payment_promises%ROWTYPE;
  includes jsonb;
  note text;
  handover_item text;
  body text;
  msg_kind text := 'action';
  msg_payload jsonb;
  new_stage text;
  title text;
  is_foreign boolean;
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

  -- Who may do what
  IF _action IN ('ask_availability', 'request_photos', 'book_inspection', 'make_offer', 'withdraw_offer',
                 'accept_quote', 'request_quote_changes', 'promise_payment', 'confirm_receipt')
     AND who <> 'buyer' THEN
    RAISE EXCEPTION 'Only the buyer can do that';
  END IF;
  IF _action IN ('confirm_available', 'reply_not_available', 'confirm_inspection', 'accept_offer', 'decline_offer',
                 'send_quote', 'record_payment', 'record_sale', 'start_handover')
     AND who <> 'seller' THEN
    RAISE EXCEPTION 'Only the seller can do that';
  END IF;

  -- When: after the final payment only handover and receipt confirmation remain; after handover, only confirmations
  IF c.stage = 'closed' THEN RAISE EXCEPTION 'This conversation is closed'; END IF;
  IF c.stage = 'completed' AND _action <> 'confirm_receipt' THEN RAISE EXCEPTION 'This sale is complete'; END IF;
  IF c.stage = 'paid' AND _action NOT IN ('start_handover', 'confirm_handover_item', 'confirm_receipt') THEN
    RAISE EXCEPTION 'The car has been paid for; only handover steps remain';
  END IF;

  IF _action = 'ask_availability' THEN
    body := 'Is this car still available?';

  ELSIF _action = 'confirm_available' THEN
    IF l.availability_status <> 'available' THEN
      RAISE EXCEPTION 'This car is not marked available. Update its status first.';
    END IF;
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
    IF c.stage = 'agreed' THEN RAISE EXCEPTION 'A price is already agreed'; END IF;
    amount := round((_payload ->> 'amount')::numeric);
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter an offer above zero'; END IF;
    UPDATE public.messages SET payload = payload || '{"status":"replaced"}'
    WHERE conversation_id = c.id AND kind = 'offer' AND payload ->> 'status' = 'pending';
    msg_kind := 'offer';
    msg_payload := jsonb_build_object('amount', amount, 'status', 'pending');
    body := 'Offer: ' || public.naira(amount) || '. An offer in chat is not a sale or a payment.';
    IF c.stage IN ('enquiry', 'inspection') THEN new_stage := 'offer'; END IF;

  ELSIF _action IN ('accept_offer', 'decline_offer', 'withdraw_offer') THEN
    SELECT * INTO ref FROM public.messages
    WHERE id = (_payload ->> 'offer_id')::uuid AND conversation_id = c.id AND kind = 'offer' FOR UPDATE;
    IF NOT FOUND OR ref.payload ->> 'status' <> 'pending' THEN RAISE EXCEPTION 'That offer is no longer open'; END IF;
    amount := (ref.payload ->> 'amount')::numeric;
    UPDATE public.messages
    SET payload = payload || jsonb_build_object('status',
      CASE _action WHEN 'accept_offer' THEN 'accepted' WHEN 'decline_offer' THEN 'declined' ELSE 'withdrawn' END)
    WHERE id = ref.id;
    msg_kind := 'offer_response';
    msg_payload := jsonb_build_object('offer_id', ref.id, 'amount', amount);
    IF _action = 'accept_offer' THEN
      UPDATE public.conversations SET agreed_price = amount WHERE id = c.id;
      new_stage := 'agreed';
      body := 'Offer of ' || public.naira(amount) || ' accepted. This is an agreement in chat, not a sale or a payment.';
    ELSIF _action = 'decline_offer' THEN
      body := 'Offer of ' || public.naira(amount) || ' declined.';
    ELSE
      body := 'Offer of ' || public.naira(amount) || ' withdrawn.';
    END IF;

  ELSIF _action = 'send_quote' THEN
    IF c.stage = 'agreed' THEN RAISE EXCEPTION 'A price is already agreed'; END IF;
    amount := round((_payload ->> 'amount')::numeric);
    due := (_payload ->> 'valid_until')::date;
    includes := coalesce(_payload -> 'includes', '[]'::jsonb);
    note := left(btrim(coalesce(_payload ->> 'note', '')), 300);
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter the quoted price'; END IF;
    IF due IS NULL OR due < today THEN RAISE EXCEPTION 'Choose a valid-until date from today on'; END IF;
    IF jsonb_typeof(includes) <> 'array' OR jsonb_array_length(includes) > 10 THEN RAISE EXCEPTION 'List up to 10 included items'; END IF;
    UPDATE public.messages SET payload = payload || '{"status":"replaced"}'
    WHERE conversation_id = c.id AND kind = 'quote' AND payload ->> 'status' = 'pending';
    msg_kind := 'quote';
    msg_payload := jsonb_build_object('amount', amount, 'valid_until', due, 'includes', includes, 'note', nullif(note, ''), 'status', 'pending');
    body := 'Quote: ' || public.naira(amount) || ', valid until ' || to_char(due, 'FMDD Mon YYYY') || '.';
    IF c.stage IN ('enquiry', 'inspection') THEN new_stage := 'offer'; END IF;

  ELSIF _action IN ('accept_quote', 'request_quote_changes') THEN
    SELECT * INTO ref FROM public.messages
    WHERE id = (_payload ->> 'quote_id')::uuid AND conversation_id = c.id AND kind = 'quote' FOR UPDATE;
    IF NOT FOUND OR ref.payload ->> 'status' <> 'pending' THEN RAISE EXCEPTION 'That quote is no longer open'; END IF;
    amount := (ref.payload ->> 'amount')::numeric;
    msg_kind := 'quote_response';
    msg_payload := jsonb_build_object('quote_id', ref.id, 'amount', amount);
    IF _action = 'accept_quote' THEN
      IF (ref.payload ->> 'valid_until')::date < today THEN RAISE EXCEPTION 'This quote has expired. Ask the seller for a new one.'; END IF;
      UPDATE public.messages SET payload = payload || '{"status":"accepted"}' WHERE id = ref.id;
      UPDATE public.conversations SET agreed_price = amount WHERE id = c.id;
      new_stage := 'agreed';
      body := 'Quote of ' || public.naira(amount) || ' accepted. This is an agreement in chat, not a sale or a payment.';
    ELSE
      note := left(btrim(coalesce(_payload ->> 'note', '')), 300);
      UPDATE public.messages SET payload = payload || '{"status":"changes_requested"}' WHERE id = ref.id;
      msg_payload := msg_payload || jsonb_build_object('note', nullif(note, ''));
      body := 'Could you change the quote?' || CASE WHEN note <> '' THEN ' ' || note ELSE '' END;
    END IF;

  ELSIF _action = 'promise_payment' THEN
    amount := round((_payload ->> 'amount')::numeric);
    due := (_payload ->> 'due_date')::date;
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter the amount you will pay'; END IF;
    IF due IS NULL OR due < today THEN RAISE EXCEPTION 'Choose a date from today on'; END IF;
    -- A new promise replaces any promise still open
    UPDATE public.payment_promises SET cancelled_at = now()
    WHERE conversation_id = c.id AND kept_at IS NULL AND cancelled_at IS NULL;
    INSERT INTO public.payment_promises (conversation_id, buyer_id, seller_id, amount, due_date)
    VALUES (c.id, c.buyer_id, c.seller_id, amount, due) RETURNING * INTO promise;
    msg_kind := 'promise';
    msg_payload := jsonb_build_object('promise_id', promise.id, 'amount', amount, 'due_date', due);
    body := 'I will pay ' || public.naira(amount) || ' by ' || to_char(due, 'FMDay DD Mon') || '.';

  ELSIF _action IN ('record_payment', 'record_sale') THEN
    amount := round((_payload ->> 'amount')::numeric);
    method := _payload ->> 'payment_method';
    IF amount IS NULL OR amount <= 0 THEN RAISE EXCEPTION 'Enter the amount paid'; END IF;
    IF method IS NULL OR method NOT IN ('cash', 'bank_transfer', 'pos', 'ussd', 'other') THEN
      RAISE EXCEPTION 'Choose how the buyer paid';
    END IF;
    IF _action = 'record_sale' THEN
      IF l.availability_status = 'sold' THEN RAISE EXCEPTION 'This car is already marked sold'; END IF;
      receipt_kind := 'final';
    ELSE
      receipt_kind := CASE WHEN _payload ->> 'kind' = 'part_payment' THEN 'part_payment' ELSE 'deposit' END;
    END IF;

    INSERT INTO public.sale_receipts (receipt_number, conversation_id, listing_id, buyer_id, seller_id, car_title, amount, payment_method, kind)
    VALUES ('MC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.sale_receipt_number_seq')::text, 6, '0'),
            c.id, l.id, c.buyer_id, c.seller_id, title, amount, method, receipt_kind)
    RETURNING * INTO receipt;
    PERFORM public.award_mid_points(c.seller_id, 'receipt_sent', 'receipt_sent:' || receipt.id, 'sale_receipts:' || receipt.id);
    PERFORM public.settle_payment_promises(c.id);

    msg_kind := 'receipt';
    msg_payload := jsonb_build_object('receipt_id', receipt.id, 'receipt_number', receipt.receipt_number, 'amount', amount,
                                      'payment_method', method, 'kind', receipt_kind);
    IF _action = 'record_sale' THEN
      -- The car is sold: Open Inventory records it and the seller's MID gets the sale points
      UPDATE public.car_listings SET availability_status = 'sold' WHERE id = l.id;
      body := 'Final payment recorded: ' || public.naira(amount) || '. Receipt ' || receipt.receipt_number || '. The car is marked sold.';
      -- If the handover was already completed, the sale is now complete
      new_stage := CASE WHEN EXISTS (SELECT 1 FROM public.handover_items WHERE conversation_id = c.id)
                         AND NOT EXISTS (SELECT 1 FROM public.handover_items
                                         WHERE conversation_id = c.id AND (seller_confirmed_at IS NULL OR buyer_confirmed_at IS NULL))
                        THEN 'completed' ELSE 'paid' END;
    ELSE
      body := CASE receipt_kind WHEN 'deposit' THEN 'Deposit' ELSE 'Part payment' END
              || ' recorded: ' || public.naira(amount) || '. Receipt ' || receipt.receipt_number || '.';
    END IF;

  ELSIF _action = 'confirm_receipt' THEN
    UPDATE public.sale_receipts SET buyer_confirmed_at = now()
    WHERE id = (_payload ->> 'receipt_id')::uuid AND conversation_id = c.id AND buyer_id = me AND buyer_confirmed_at IS NULL
    RETURNING * INTO receipt;
    IF receipt.id IS NULL THEN RAISE EXCEPTION 'There is no receipt to confirm'; END IF;
    msg_payload := jsonb_build_object('receipt_id', receipt.id);
    body := 'I confirm receipt ' || receipt.receipt_number || ' is correct.';

  ELSIF _action = 'start_handover' THEN
    IF c.stage NOT IN ('agreed', 'paid') THEN RAISE EXCEPTION 'Agree a price before starting the handover'; END IF;
    IF EXISTS (SELECT 1 FROM public.handover_items WHERE conversation_id = c.id) THEN
      RAISE EXCEPTION 'The handover checklist has already been started';
    END IF;
    is_foreign := lower(replace(coalesce(l.condition, ''), '-', '_')) IN ('foreign_used', 'tokunbo', 'foreign used');
    INSERT INTO public.handover_items (conversation_id, item_key, label, position) VALUES
      (c.id, 'ownership', 'Proof of ownership (purchase receipt or change of ownership)', 1),
      (c.id, 'licence', 'Vehicle licence', 2),
      (c.id, 'roadworthiness', 'Roadworthiness certificate', 3),
      (c.id, 'insurance', 'Insurance certificate', 5),
      (c.id, 'keys', 'All keys, including the spare', 6),
      (c.id, 'car', 'Car handed over to the buyer', 7);
    IF is_foreign THEN
      INSERT INTO public.handover_items (conversation_id, item_key, label, position)
      VALUES (c.id, 'customs', 'Customs duty papers', 4);
    END IF;
    msg_kind := 'handover';
    msg_payload := jsonb_build_object('status', 'started');
    body := 'Handover checklist started. Tick each item as it is handed over; both of us confirm.';

  ELSIF _action = 'confirm_handover_item' THEN
    handover_item := _payload ->> 'item';
    IF who = 'seller' THEN
      UPDATE public.handover_items SET seller_confirmed_at = now()
      WHERE conversation_id = c.id AND handover_items.item_key = handover_item AND seller_confirmed_at IS NULL;
    ELSE
      UPDATE public.handover_items SET buyer_confirmed_at = now()
      WHERE conversation_id = c.id AND handover_items.item_key = handover_item AND buyer_confirmed_at IS NULL;
    END IF;
    IF NOT FOUND THEN RAISE EXCEPTION 'That item is already confirmed or is not on the checklist'; END IF;
    UPDATE public.conversations SET updated_at = now() WHERE id = c.id;

    -- Only the completing tick leaves a message; the checklist itself shows each tick
    IF NOT EXISTS (SELECT 1 FROM public.handover_items
                   WHERE conversation_id = c.id AND (seller_confirmed_at IS NULL OR buyer_confirmed_at IS NULL)) THEN
      msg_kind := 'handover';
      msg_payload := jsonb_build_object('status', 'complete');
      body := 'Handover complete: both of us have confirmed every item.';
      IF EXISTS (SELECT 1 FROM public.sale_receipts WHERE conversation_id = c.id AND kind = 'final') THEN
        new_stage := 'completed';
      END IF;
    ELSE
      RETURN NULL;
    END IF;

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

-- ---------------------------------------------------------------------------
-- 8. Live updates
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['messages', 'conversations', 'message_reactions', 'handover_items'] LOOP
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END $$;

COMMIT;
