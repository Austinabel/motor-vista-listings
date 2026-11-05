-- Reverses 20261108120000_wavechat_conversation_features.sql, back to the WaveChat of 20261107120000.
-- Deletes payment promises, the handover checklist, reactions, last-seen times and every deposit or
-- part-payment receipt; attachments stay in the 'wavechat' bucket until removed by hand.
-- Then re-run the wavechat_action and guard_message definitions from 20261107120000_wavechat.sql.

BEGIN;

DROP FUNCTION IF EXISTS public.settle_payment_promises(uuid);
DELETE FROM public.mid_point_rules WHERE event_type = 'payment_promise_kept'
  AND NOT EXISTS (SELECT 1 FROM public.mid_score_ledger WHERE event_type = 'payment_promise_kept');
DROP TABLE IF EXISTS public.handover_items;
DROP TABLE IF EXISTS public.payment_promises;

ALTER TABLE public.sale_receipts DISABLE TRIGGER keep_sale_receipts;
DELETE FROM public.sale_receipts WHERE kind <> 'final';
ALTER TABLE public.sale_receipts ENABLE TRIGGER keep_sale_receipts;
DROP INDEX IF EXISTS public.sale_receipts_one_final_per_conversation;
ALTER TABLE public.sale_receipts DROP CONSTRAINT IF EXISTS sale_receipts_kind_check;
ALTER TABLE public.sale_receipts DROP COLUMN IF EXISTS kind;
CREATE UNIQUE INDEX IF NOT EXISTS sale_receipts_one_per_conversation ON public.sale_receipts (conversation_id);

DROP POLICY IF EXISTS "WaveChat participants read attachments" ON storage.objects;
DROP POLICY IF EXISTS "WaveChat participants upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "WaveChat senders remove their attachments" ON storage.objects;

DROP FUNCTION IF EXISTS public.get_chat_partner_last_seen(uuid);
DROP FUNCTION IF EXISTS public.touch_presence();
DROP TABLE IF EXISTS public.user_presence;
DROP TABLE IF EXISTS public.message_reactions;
DROP FUNCTION IF EXISTS public.delete_my_message(uuid);
DROP FUNCTION IF EXISTS public.count_unread_messages();
DROP FUNCTION IF EXISTS public.mark_conversation_read(uuid);
DROP FUNCTION IF EXISTS public.mark_conversation_delivered(uuid);
DROP FUNCTION IF EXISTS public.is_chat_participant(uuid);

-- Structured kinds added here become plain text, keeping their wording
UPDATE public.messages SET kind = 'text', action = NULL, payload = NULL
WHERE kind IN ('quote', 'quote_response', 'payment', 'promise', 'handover');
DROP INDEX IF EXISTS public.idx_messages_unread;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_attachment_type_check;
ALTER TABLE public.messages
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS read_at,
  DROP COLUMN IF EXISTS delivered_at,
  DROP COLUMN IF EXISTS attachment_duration,
  DROP COLUMN IF EXISTS attachment_size,
  DROP COLUMN IF EXISTS attachment_name,
  DROP COLUMN IF EXISTS attachment_type,
  DROP COLUMN IF EXISTS attachment_path,
  DROP COLUMN IF EXISTS reply_to_id;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_kind_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_kind_check
  CHECK (kind IN ('text', 'action', 'offer', 'offer_response', 'receipt'));

UPDATE public.conversations SET stage = 'completed' WHERE stage = 'paid';
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_stage_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_stage_check
  CHECK (stage IN ('enquiry', 'inspection', 'offer', 'agreed', 'completed', 'closed'));

COMMIT;
