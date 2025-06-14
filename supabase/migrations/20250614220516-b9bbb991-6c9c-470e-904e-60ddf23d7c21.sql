
-- Create car listings table
CREATE TABLE public.car_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT NOT NULL,
  mileage TEXT,
  price NUMERIC NOT NULL,
  condition TEXT NOT NULL,
  fuel_type TEXT,
  transmission TEXT,
  color TEXT,
  location TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  listing_plan TEXT NOT NULL DEFAULT 'free' CHECK (listing_plan IN ('free', 'standard', 'featured')),
  listing_price NUMERIC NOT NULL DEFAULT 0,
  listing_duration INTEGER NOT NULL DEFAULT 30, -- days
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create car listing images table
CREATE TABLE public.car_listing_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on car listings
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_listing_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for car listings
CREATE POLICY "Users can view all approved listings" 
  ON public.car_listings 
  FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings" 
  ON public.car_listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
  ON public.car_listings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any listing" 
  ON public.car_listings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  ));

-- RLS policies for car listing images
CREATE POLICY "Users can view images for accessible listings" 
  ON public.car_listing_images 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE id = listing_id 
    AND (status = 'approved' OR user_id = auth.uid())
  ));

CREATE POLICY "Users can manage images for their own listings" 
  ON public.car_listing_images 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE id = listing_id 
    AND user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_car_listings_user_id ON public.car_listings(user_id);
CREATE INDEX idx_car_listings_status ON public.car_listings(status);
CREATE INDEX idx_car_listings_make_model ON public.car_listings(make, model);
CREATE INDEX idx_car_listings_location ON public.car_listings(location);
CREATE INDEX idx_car_listings_created_at ON public.car_listings(created_at);
CREATE INDEX idx_car_listing_images_listing_id ON public.car_listing_images(listing_id);
