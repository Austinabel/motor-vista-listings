import { formatNaira } from "@/lib/format";

// Open Inventory events as buyers and sellers read them. Each line says only what the event
// recorded; nothing is inferred from gaps between events.

export type InventoryEventType =
  | "submitted"
  | "listed"
  | "price_changed"
  | "availability_confirmed"
  | "reserved"
  | "made_available"
  | "sold"
  | "withdrawn"
  | "renewed"
  | "vin_added";

export interface InventoryEvent {
  eventType: InventoryEventType;
  occurredAt: string;
  fromValue: Record<string, unknown> | null;
  toValue: Record<string, unknown> | null;
  backfilled: boolean;
}

export type EventTone = "neutral" | "good" | "warning" | "closed";

const price = (value: Record<string, unknown> | null) => {
  const amount = Number(value?.price);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

export const describeInventoryEvent = (event: InventoryEvent): { label: string; tone: EventTone } => {
  switch (event.eventType) {
    case "submitted":
      return { label: "Submitted for review", tone: "neutral" };
    case "listed": {
      const at = price(event.toValue);
      return { label: at ? `Listed at ${formatNaira(at)}` : "Listed", tone: "neutral" };
    }
    case "price_changed": {
      const before = price(event.fromValue);
      const after = price(event.toValue);
      if (before && after) {
        return {
          label: `Price ${after < before ? "reduced" : "raised"} from ${formatNaira(before)} to ${formatNaira(after)}`,
          tone: "neutral",
        };
      }
      return { label: "Price changed", tone: "neutral" };
    }
    case "availability_confirmed":
      return { label: "Seller confirmed it's still available", tone: "good" };
    case "made_available":
      return { label: "Available for sale", tone: "good" };
    case "reserved":
      return { label: "Reserved for a buyer", tone: "warning" };
    case "sold":
      return { label: "Marked sold", tone: "closed" };
    case "withdrawn":
      return { label: "Withdrawn from sale", tone: "closed" };
    case "renewed":
      return { label: "Listing renewed", tone: "neutral" };
    case "vin_added":
      return { label: "VIN added", tone: "neutral" };
  }
};

/** A VIN as stored: upper case, no spaces; 17 characters without I, O or Q. Null when invalid. */
export const normaliseVin = (value: string): string | null => {
  const vin = value.replace(/\s/g, "").toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin) ? vin : null;
};
