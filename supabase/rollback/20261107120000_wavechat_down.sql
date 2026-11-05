-- Reverses 20261107120000_wavechat.sql.
-- Deletes every receipt and the WaveChat columns (stage, offers, inspection times). Plain text
-- messages and conversations are kept. Export sale_receipts first if it holds anything worth keeping.
-- Note: this also removes the two security guards on conversations and messages added here.

BEGIN;

CREATE OR REPLACE FUNCTION public.motorcars_feature_built(_feature text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT _feature IN ('mid', 'oio') $$;

UPDATE public.platform_features SET mode = 'preview' WHERE feature = 'wavechat' AND mode = 'motorcars';

DROP TRIGGER IF EXISTS keep_sale_receipts ON public.sale_receipts;
DROP FUNCTION IF EXISTS public.keep_sale_receipts();
DROP FUNCTION IF EXISTS public.wavechat_action(uuid, text, jsonb, uuid);
DROP FUNCTION IF EXISTS public.naira(numeric);
DROP FUNCTION IF EXISTS public.start_wavechat(uuid);
DROP TRIGGER IF EXISTS a_guard_message ON public.messages;
DROP FUNCTION IF EXISTS public.guard_message();
DROP TRIGGER IF EXISTS a_guard_conversation ON public.conversations;
DROP FUNCTION IF EXISTS public.guard_conversation();
DROP FUNCTION IF EXISTS public.seller_accepts_messages(uuid);
DROP FUNCTION IF EXISTS public.listing_open_for_chat(uuid, uuid);
DROP TABLE IF EXISTS public.sale_receipts;
DROP SEQUENCE IF EXISTS public.sale_receipt_number_seq;

-- Structured messages become plain text (their content already reads as text)
DROP INDEX IF EXISTS public.messages_client_event_id;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_kind_check;
ALTER TABLE public.messages
  DROP COLUMN IF EXISTS client_event_id,
  DROP COLUMN IF EXISTS payload,
  DROP COLUMN IF EXISTS action,
  DROP COLUMN IF EXISTS kind;

ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_stage_check;
ALTER TABLE public.conversations
  DROP COLUMN IF EXISTS agreed_price,
  DROP COLUMN IF EXISTS inspection_confirmed,
  DROP COLUMN IF EXISTS inspection_at,
  DROP COLUMN IF EXISTS stage;

COMMIT;
