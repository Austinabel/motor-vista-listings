
-- Add ID card verification and payment tracking fields to dealers table
ALTER TABLE public.dealers 
ADD COLUMN IF NOT EXISTS id_card_number TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Create index for payment reference
CREATE INDEX IF NOT EXISTS idx_dealers_payment_reference ON public.dealers(payment_reference);
CREATE INDEX IF NOT EXISTS idx_dealers_payment_status ON public.dealers(payment_status);
