
-- Create a private storage bucket for dealer documents with security policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dealer_documents', 'dealer_documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Add a column to the dealers table to store the path of the uploaded ID card
ALTER TABLE public.dealers
ADD COLUMN IF NOT EXISTS id_card_path TEXT;

-- Drop existing policies to ensure this script can be re-run safely
DROP POLICY IF EXISTS "Allow authenticated users to upload their own ID card" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own ID card" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to view dealer ID cards" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own ID card" ON storage.objects;

-- Create RLS policies for the dealer_documents bucket

-- Allow authenticated users to upload their own ID card into a folder named with their user_id
CREATE POLICY "Allow authenticated users to upload their own ID card"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dealer_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own ID card
CREATE POLICY "Allow authenticated users to update their own ID card"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dealer_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users (acting as admins) to read all objects from the bucket
CREATE POLICY "Allow admins to view dealer ID cards"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'dealer_documents' );

-- Allow users to delete their own uploaded files
CREATE POLICY "Allow authenticated users to delete their own ID card"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dealer_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
