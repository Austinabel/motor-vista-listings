import { supabase } from "@/integrations/supabase/client";
import { fetchListingsByIds, type ListingSummary } from "@/services/listings";

export interface SavedCar {
  favoriteId: string;
  listingId: string;
  savedAt: string;
  /** null when the listing is no longer public (sold, withdrawn, removed or rejected) */
  listing: ListingSummary | null;
}

/** The user's saved cars, newest first, including ones that are no longer available. */
export async function fetchSavedCars(userId: string): Promise<SavedCar[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, listing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const listings = await fetchListingsByIds(rows.map((row) => row.listing_id));
  return rows.map((row) => {
    const listing = listings.get(row.listing_id) ?? null;
    const closed = listing?.availabilityStatus === "sold" || listing?.availabilityStatus === "unavailable";
    return { favoriteId: row.id, listingId: row.listing_id, savedAt: row.created_at, listing: closed ? null : listing };
  });
}

export async function removeSavedCar(userId: string, listingId: string): Promise<void> {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
  if (error) throw error;
}
