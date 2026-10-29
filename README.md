# Motocars.ng

A car marketplace for Nigeria. Private sellers and verified dealers list cars; buyers browse, save favorites and message sellers. Admins approve listings and dealers, confirm manual bank-transfer payments, and manage featured/boosted placements.

Originally generated with [Lovable](https://lovable.dev/projects/5dd4da10-8947-4bf9-a19a-9e5cc236c059); changes pushed to the connected repo sync back to Lovable.

## Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), React Router, TanStack Query, react-hook-form + zod
- **Backend:** Supabase (Postgres with row-level security, Auth, Storage, Edge Functions)
- **Email:** Resend, called from Supabase Edge Functions

## Getting started

Requires Node.js 18+.

```sh
npm install
npm run dev       # http://localhost:8080
npm run build     # production build in dist/
npm run lint
```

The Supabase project is configured in `.env`:

```
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...   # the public anon key
```

The anon key ships to the browser, so all data protection lives in the database's RLS policies and SECURITY DEFINER functions, not in the frontend.

## Project layout

```
src/
  pages/                 one component per route (routes are declared in App.tsx)
  components/            page sections and shared widgets
  components/admin/      admin panel forms and managers
  components/ui/         shadcn/ui primitives
  contexts/              AuthContext, DealerContext, MessagingContext
  integrations/supabase/ client and generated database types
supabase/
  migrations/            schema, RLS policies, functions and triggers (applied in order)
  functions/             Edge Functions: send-confirmation-email, send-notification-email
```

## Domain overview

| Table | Purpose |
| --- | --- |
| `profiles` | One row per user; holds the monthly free-listing counter |
| `dealers` | Dealer applications and verified dealers (ID card, CAC number, payment reference) |
| `car_listings`, `car_listing_images` | Listings and their photos |
| `favorites` | Saved listings |
| `conversations`, `messages` | Buyer–seller messaging |
| `listing_enhancement_requests` | Requests to feature/boost a listing |
| `notifications` | In-app notifications sent by admins |
| `user_roles` | Admin role assignments (checked by `is_admin()`) |
| `app_settings` | Admin-controlled settings such as whether paid listing plans are enabled |

**Listing lifecycle:** free listings start as `pending_review`; paid plans start as `pending_payment` and move to `pending_review` once the seller submits a bank-transfer reference. An admin then sets them `active` (or rejects them).

**Free listing limits:** verified dealers get 20 free listings in total; regular users get 5 per month. `can_create_free_listing()` checks the limit and the `count_free_listing` trigger increments the counter.

**Dealer verification:** dealers upload an ID card to the private `dealer_documents` bucket and pay a registration fee by transfer; an admin verifies them. Public dealer data is served only through `get_public_dealers()` and `get_public_dealer(id)`, never by reading the `dealers` table directly.

## Admin access

Admins are users with an `admin` row in `user_roles`. Grant it from the Supabase SQL editor:

```sql
SELECT public.assign_admin_role('person@example.com');
```

This function is not callable through the API.

## Deploying database changes

Apply new migrations with the Supabase CLI (`supabase db push`) or by running them in the SQL editor. Regenerate `src/integrations/supabase/types.ts` afterwards with `supabase gen types typescript`.
