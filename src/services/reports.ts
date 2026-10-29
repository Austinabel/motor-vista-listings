import { supabase } from "@/integrations/supabase/client";

// Buyer reports of suspicious or misleading listings, and the admin queue that resolves them.
// Requires the listing-lifecycle migration (listing_reports table).

export const REPORT_REASONS = [
  { id: "sold_or_unavailable", label: "The car is sold or no longer available" },
  { id: "wrong_details", label: "Price, photos or details are wrong" },
  { id: "suspected_scam", label: "I think this is a scam" },
  { id: "duplicate", label: "The same car is listed more than once" },
  { id: "offensive", label: "Offensive or inappropriate content" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export const reportReasonLabel = (reason: string) =>
  REPORT_REASONS.find((item) => item.id === reason)?.label ?? reason;

/** Files a report as the signed-in user. A second open report on the same listing is refused. */
export async function createListingReport(listingId: string, reason: ReportReason, details: string): Promise<void> {
  const { error } = await supabase
    .from("listing_reports")
    .insert({ listing_id: listingId, reason, details: details.trim() || null });
  if (error) {
    // Unique index on (listing, reporter) for open reports
    if (error.code === "23505") throw new Error("You have already reported this listing. We are looking into it.");
    throw error;
  }
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

/** Open reports, oldest first (admins only, by database policy). */
export async function fetchOpenReports(): Promise<ListingReport[]> {
  const { data, error } = await supabase
    .from("listing_reports")
    .select("id, listing_id, reason, details, status, created_at, car_listings(year, make, model)")
    .eq("status", "open")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const listing = row.car_listings as unknown as { year: number; make: string; model: string } | null;
    return {
      id: row.id,
      listingId: row.listing_id,
      listingTitle: listing ? `${listing.year} ${listing.make} ${listing.model}` : "Removed listing",
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function resolveReport(id: string, outcome: "resolved" | "dismissed", adminId: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from("listing_reports")
    .update({ status: outcome, resolved_at: new Date().toISOString(), resolved_by: adminId, admin_notes: notes.trim() || null })
    .eq("id", id);
  if (error) throw error;
}
