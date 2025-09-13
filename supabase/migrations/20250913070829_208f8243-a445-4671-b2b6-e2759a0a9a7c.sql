-- Create storage bucket for car listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-listing-images', 'car-listing-images', true);

-- Create policies for car listing images bucket
CREATE POLICY "Anyone can view car listing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'car-listing-images');

CREATE POLICY "Authenticated users can upload car listing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'car-listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own car listing images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'car-listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own car listing images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'car-listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);