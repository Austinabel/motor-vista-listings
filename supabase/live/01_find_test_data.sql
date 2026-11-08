-- Read-only list of every account, dealer and car, to pick out test data before launch.
-- Changes nothing. Run it in the Supabase SQL Editor; copy the emails and ids of the test ones
-- into 02_cleanup_test_data.sql.

SELECT kind, name, id, created, details, owner_email
FROM (
  SELECT 1 AS sort,
         'account' AS kind,
         u.email::text AS name,
         u.id::text AS id,
         u.created_at::date AS created,
         CASE
           WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role::text = 'admin')
             OR p.user_type::text = 'admin' THEN 'ADMIN, keep'
           ELSE coalesce(p.user_type::text, 'no profile')
         END || ', ' || (SELECT count(*) FROM public.car_listings l WHERE l.user_id = u.id) || ' cars' AS details,
         NULL::text AS owner_email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id

  UNION ALL

  SELECT 2, 'dealer', d.business_name::text, d.id::text, d.created_at::date,
         CASE WHEN d.user_id IS NULL THEN 'no account of its own' ELSE 'has an account' END,
         u.email::text
  FROM public.dealers d
  LEFT JOIN auth.users u ON u.id = d.user_id

  UNION ALL

  SELECT 3, 'car', concat_ws(' ', l.year, l.make, l.model), l.id::text, l.created_at::date,
         l.status::text,
         u.email::text
  FROM public.car_listings l
  LEFT JOIN auth.users u ON u.id = l.user_id
) everything
ORDER BY sort, created, name;
