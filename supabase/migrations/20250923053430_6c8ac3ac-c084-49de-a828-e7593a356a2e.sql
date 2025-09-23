-- Fix the search path for existing functions to resolve security warnings
-- Update functions that don't have SET search_path specified

-- Fix update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix get_seller_info_for_listing function  
CREATE OR REPLACE FUNCTION public.get_seller_info_for_listing(listing_user_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, user_type text)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT p.id, p.first_name, p.last_name, p.user_type
  FROM public.profiles p
  INNER JOIN public.car_listings cl ON p.id = cl.user_id
  WHERE p.id = listing_user_id 
    AND cl.status = 'active'
    AND cl.user_id = listing_user_id;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;