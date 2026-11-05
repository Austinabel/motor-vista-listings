import { supabase } from "@/integrations/supabase/client";
import type { InventoryEvent, InventoryEventType } from "@/lib/inventory";
import { MoatwaveNotConnectedError } from "@/services/mid";
import type { FeatureMode } from "@/services/platformFeatures";

// Open Inventory. The Motorcars version reads the inventory_events history kept in Motorcars'
// own database; the Moatwave version isn't connected yet. Pages call inventoryService(mode).

export interface StandInventory {
  available: number;
  reserved: number;
  soldRecorded: number;
  lastActivityAt: string | null;
}

export interface InventoryService {
  getListingHistory(listingId: string): Promise<InventoryEvent[]>;
  getStandInventory(sellerId: string): Promise<StandInventory | null>;
  getVin(listingId: string): Promise<string | null>;
  setVin(listingId: string, vin: string): Promise<void>;
}

const asRecord = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : null);

const vinError = (message: string, code?: string) =>
  code === "23505" || /one_live_listing_per_vin/.test(message)
    ? "This VIN is already on another live listing."
    : /vin_format/.test(message)
      ? "That isn't a valid VIN."
      : message;

const motorcarsInventory: InventoryService = {
  async getListingHistory(listingId) {
    const { data, error } = await supabase.rpc("get_listing_history", { _listing_id: listingId });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      eventType: row.event_type as InventoryEventType,
      occurredAt: row.occurred_at,
      fromValue: asRecord(row.from_value),
      toValue: asRecord(row.to_value),
      backfilled: row.backfilled,
    }));
  },

  async getStandInventory(sellerId) {
    const { data, error } = await supabase.rpc("get_stand_inventory", { _seller_id: sellerId });
    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return null;
    return {
      available: row.available,
      reserved: row.reserved,
      soldRecorded: row.sold_recorded,
      lastActivityAt: row.last_activity_at,
    };
  },

  async getVin(listingId) {
    const { data, error } = await supabase.from("car_listings").select("vin").eq("id", listingId).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.vin ?? null;
  },

  async setVin(listingId, vin) {
    const { error } = await supabase.from("car_listings").update({ vin }).eq("id", listingId);
    if (error) throw new Error(vinError(error.message, error.code));
  },
};

const notConnected = async (): Promise<never> => {
  throw new MoatwaveNotConnectedError();
};

const moatwaveInventory: InventoryService = {
  getListingHistory: notConnected,
  getStandInventory: notConnected,
  getVin: notConnected,
  setVin: notConnected,
};

export const inventoryService = (mode: FeatureMode): InventoryService =>
  mode === "moatwave" ? moatwaveInventory : motorcarsInventory;

export { vinError };
