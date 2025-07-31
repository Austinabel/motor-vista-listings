-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Step 5: Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Step 6: Drop the insecure admin policy
DROP POLICY IF EXISTS "Admins can view all listings" ON public.car_listings;

-- Step 7: Create secure admin policy using the role function
CREATE POLICY "Admins can view all listings" 
ON public.car_listings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Step 8: Also update the admin update policy to use secure role check
DROP POLICY IF EXISTS "Admins can update any listing" ON public.car_listings;

CREATE POLICY "Admins can update any listing" 
ON public.car_listings 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));