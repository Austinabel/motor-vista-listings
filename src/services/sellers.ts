import { supabase } from "@/integrations/supabase/client";

// Public seller identity for a listing, limited to what the seller and the database allow.
// Seller identity moves to Moatwave MID once its API contract is confirmed.

export interface SellerPublicInfo {
  kind: "dealer" | "private" | "unknown";
  /** First name and last initial, only when the seller's profile is set to show. */
  displayName: string | null;
  /** Only when the seller chose to show their number and the visitor may read it. */
  phone: string | null;
  /** Approved dealer business, when the database lets this visitor read it. */
  dealer: { id: string; businessName: string; state: string | null } | null;
}

const toDisplayName = (first: string | null, last: string | null) => {
  const firstName = first?.trim();
  if (!firstName) return null;
  const initial = last?.trim().charAt(0);
  return initial ? `${firstName} ${initial.toUpperCase()}.` : firstName;
};

export async function fetchSellerPublicInfo(sellerId: string, signedIn: boolean): Promise<SellerPublicInfo> {
  // Signed-in visitors may read the profile of a seller with an active listing (database policy),
  // including the seller's own privacy choices.
  let profile: {
    first_name: string | null;
    last_name: string | null;
    user_type: string | null;
    show_profile: boolean | null;
    show_phone_number: boolean | null;
    phone: string | null;
  } | null = null;

  if (signedIn) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, user_type, show_profile, show_phone_number, phone")
      .eq("id", sellerId)
      .maybeSingle();
    profile = data;
  }

  let userType = profile?.user_type ?? null;
  if (!profile) {
    // Anonymous visitors: this function returns names, but not the seller's privacy setting,
    // so only the seller type is used.
    const { data } = await supabase.rpc("get_seller_info_for_listing", { listing_user_id: sellerId });
    userType = data?.[0]?.user_type ?? null;
  }

  const kind: SellerPublicInfo["kind"] = userType === "dealer" ? "dealer" : userType ? "private" : "unknown";

  let dealer: SellerPublicInfo["dealer"] = null;
  if (kind === "dealer") {
    // Approved dealers only, public fields only (security-hardening migration)
    const { data } = await supabase.rpc("get_public_dealer_by_seller", { seller_id: sellerId });
    const match = data?.[0];
    if (match) dealer = { id: match.id, businessName: match.business_name, state: match.state };
  }

  return {
    kind,
    displayName: profile && profile.show_profile !== false ? toDisplayName(profile.first_name, profile.last_name) : null,
    phone: profile?.show_phone_number ? profile.phone?.trim() || null : null,
    dealer,
  };
}
