import { supabase } from "@/integrations/supabase/client";

// Dealer and car-stand discovery.
// Reads public business data through the get_public_dealers database function.
// Business identity, staff and permissions move to Moatwave once its API contract is confirmed.

export interface DealerSummary {
  id: string;
  businessName: string;
  state: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface DealerProfileData extends DealerSummary {
  /** The dealer's seller account; already public on every listing they post. */
  userId: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  yearEstablished: string | null;
}

/** One approved dealer's public profile, or null when it does not exist or is not approved. */
export async function fetchPublicDealer(dealerId: string): Promise<DealerProfileData | null> {
  const { data, error } = await supabase.rpc("get_public_dealer", { dealer_id: dealerId }).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    businessName: data.business_name,
    state: data.state,
    description: data.description,
    imageUrl: data.image_url ?? null,
    address: data.address,
    phone: data.phone,
    website: data.website,
    yearEstablished: data.year_established,
  };
}

export async function fetchPublicDealers(): Promise<DealerSummary[]> {
  const { data, error } = await supabase.rpc("get_public_dealers");
  if (error) throw error;

  return (data ?? []).map((dealer) => ({
    id: dealer.id,
    businessName: dealer.business_name,
    state: dealer.state,
    description: dealer.description,
    // Only returned once the security-hardening migration is applied; absent before that.
    imageUrl: dealer.image_url ?? null,
  }));
}
