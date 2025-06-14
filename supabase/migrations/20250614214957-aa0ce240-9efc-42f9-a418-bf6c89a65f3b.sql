
-- Add missing columns that were referenced in the code but don't exist in the database
ALTER TABLE public.dealers 
ADD COLUMN IF NOT EXISTS id_card_type TEXT,
ADD COLUMN IF NOT EXISTS id_card_number TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Add unique constraints to prevent duplicate registrations
ALTER TABLE public.dealers 
ADD CONSTRAINT dealers_email_unique UNIQUE (email),
ADD CONSTRAINT dealers_phone_unique UNIQUE (phone), 
ADD CONSTRAINT dealers_cac_number_unique UNIQUE (cac_number);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dealers_id_card_number ON public.dealers(id_card_number);
CREATE INDEX IF NOT EXISTS idx_dealers_payment_reference ON public.dealers(payment_reference);
CREATE INDEX IF NOT EXISTS idx_dealers_payment_status ON public.dealers(payment_status);
