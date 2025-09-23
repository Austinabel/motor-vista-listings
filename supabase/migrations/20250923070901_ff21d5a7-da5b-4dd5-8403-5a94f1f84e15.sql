-- Add DELETE policy for admins on car_listings table
CREATE POLICY "Admins can delete any listing" 
ON public.car_listings 
FOR DELETE 
TO authenticated 
USING (is_admin());