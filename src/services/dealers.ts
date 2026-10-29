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
