
-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view basic profile information for sellers (needed for car listings)
CREATE POLICY "Allow public read access to seller profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Enable RLS on dealers table if not already enabled  
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view dealer information (needed for car listings)
CREATE POLICY "Allow public read access to dealer info" 
  ON public.dealers 
  FOR SELECT 
  USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profiles
CREATE POLICY "Users can insert their own profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow dealers to update their own information
CREATE POLICY "Dealers can update their own info" 
  ON public.dealers 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow dealers to insert their own information
CREATE POLICY "Dealers can insert their own info" 
  ON public.dealers 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
