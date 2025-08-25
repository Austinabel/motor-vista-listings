-- Create settings table to store app configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify settings
CREATE POLICY "Admins can manage app settings" ON public.app_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert default setting for listing plans (disabled by default)
INSERT INTO public.app_settings (key, value, description) 
VALUES ('listing_plans_enabled', 'false', 'Controls whether listing pricing plans are enabled');

-- Create trigger to update timestamps
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();