
-- Add a user_id column to the dealers table to link it to an auth.users account.
-- This allows associating car listings with a dealer profile.
ALTER TABLE public.dealers
ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
