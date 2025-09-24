-- Add privacy settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_profile BOOLEAN DEFAULT true,
ADD COLUMN show_phone_number BOOLEAN DEFAULT false,
ADD COLUMN allow_messages BOOLEAN DEFAULT true;