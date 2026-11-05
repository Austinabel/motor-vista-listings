-- Run in the STAGING project's SQL editor after creating your first account there.
-- Replace the email below with that account's email. Never run this on the live project.

-- 1. Make that account an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your-staging-email@example.com'
ON CONFLICT DO NOTHING;

-- 2. Turn on the features built so far (Admin → Moatwave features can change these afterwards)
UPDATE public.platform_features SET mode = 'motorcars' WHERE feature IN ('mid', 'oio', 'wavechat');

-- 3. Check: one admin row, three features on
SELECT (SELECT count(*) FROM public.user_roles WHERE role = 'admin') AS admins,
       (SELECT count(*) FROM public.platform_features WHERE mode = 'motorcars') AS features_on;
