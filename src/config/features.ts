// Features that depend on a database migration. Each stays off until its migration is
// applied to the database the app points at, so the app keeps working before and after.

/**
 * Seller-managed availability (available, reserved, sold, unavailable), renewal and listing
 * reports. Requires supabase/migrations/20261029120000_listing_lifecycle.sql.
 * Turn on with VITE_LISTING_LIFECYCLE=true.
 */
export const LISTING_LIFECYCLE = import.meta.env.VITE_LISTING_LIFECYCLE === "true";

/** Days after which a seller's availability confirmation is treated as stale. */
export const AVAILABILITY_FRESH_DAYS = 14;
