-- Create table for listing enhancement requests
CREATE TABLE public.listing_enhancement_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  enhancement_type TEXT NOT NULL CHECK (enhancement_type IN ('featured', 'boosted', 'top_listing')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  duration_days INTEGER NOT NULL DEFAULT 30,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_enhancement_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for listing enhancement requests
CREATE POLICY "Users can view their own requests" 
ON public.listing_enhancement_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.listing_enhancement_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" 
ON public.listing_enhancement_requests 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create index for better performance
CREATE INDEX idx_listing_enhancement_requests_status ON public.listing_enhancement_requests(status);
CREATE INDEX idx_listing_enhancement_requests_user_id ON public.listing_enhancement_requests(user_id);
CREATE INDEX idx_listing_enhancement_requests_listing_id ON public.listing_enhancement_requests(listing_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listing_enhancement_requests_updated_at
BEFORE UPDATE ON public.listing_enhancement_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();