-- Create missing app_settings record for listing_plans_enabled
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'listing_plans_enabled',
  'true'::jsonb,
  'Controls whether listing plans are enabled in the application'
)
ON CONFLICT (key) DO NOTHING;