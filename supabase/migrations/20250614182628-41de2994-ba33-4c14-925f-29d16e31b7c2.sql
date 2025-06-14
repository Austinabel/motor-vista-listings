
-- Create dealers table to store dealer registration data
CREATE TABLE public.dealers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  year_established TEXT NOT NULL,
  cac_number TEXT NOT NULL,
  tax_id TEXT,
  description TEXT NOT NULL,
  website TEXT,
  monthly_inventory TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public to insert (register)
CREATE POLICY "Anyone can register as dealer" 
  ON public.dealers 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow public to view verified dealers
CREATE POLICY "Anyone can view verified dealers" 
  ON public.dealers 
  FOR SELECT 
  USING (status = 'verified');

-- Create policy to allow authenticated users to view all dealers (for admin)
CREATE POLICY "Authenticated users can view all dealers" 
  ON public.dealers 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to update dealer status (for admin)
CREATE POLICY "Authenticated users can update dealers" 
  ON public.dealers 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX idx_dealers_status ON public.dealers(status);
CREATE INDEX idx_dealers_email ON public.dealers(email);
