-- Gives an existing account admin rights. Sign up normally on the site first.
-- Put the account's email below and run it in the Supabase SQL Editor. Safe to run twice.
-- To remove admin rights later:
--   DELETE FROM public.user_roles WHERE role = 'admin'
--     AND user_id = (SELECT id FROM auth.users WHERE lower(email) = lower('you@example.com'));

WITH account AS (
  SELECT id FROM auth.users WHERE lower(email) = lower(trim('you@example.com'))
), added AS (
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role FROM account
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = account.id AND r.role = 'admin'::public.app_role
  )
  RETURNING user_id
)
SELECT CASE
         WHEN NOT EXISTS (SELECT 1 FROM account) THEN 'No account with that email. Sign up on the site first, then run this again.'
         WHEN EXISTS (SELECT 1 FROM added) THEN 'Done: this account is now an admin.'
         ELSE 'This account was already an admin.'
       END AS result;
