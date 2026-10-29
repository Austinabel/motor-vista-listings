import { formatDistanceToNowStrict } from "date-fns";

export type AvailabilityTone = "confirmed" | "unconfirmed" | "reserved" | "closed";

export interface AvailabilityView {
  tone: AvailabilityTone;
  label: string;
  detail: string;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * How a listing's availability is described to buyers. A listing reads as available only when
 * its seller confirmed it within `freshDays`; otherwise the last confirmation date is shown
 * instead, and a listing never confirmed says so.
 */
export const describeAvailability = (
  status: string | null,
  confirmedAt: string | null,
  freshDays: number,
  now: Date = new Date()
): AvailabilityView => {
  if (status === "sold") {
    return { tone: "closed", label: "Sold", detail: "The seller has marked this car as sold." };
  }
  if (status === "unavailable") {
    return { tone: "closed", label: "No longer available", detail: "The seller has withdrawn this car." };
  }
  if (status === "reserved") {
    return { tone: "reserved", label: "Reserved", detail: "The seller has reserved this car for a buyer. Ask whether it may become available." };
  }

  if (!confirmedAt) {
    return {
      tone: "unconfirmed",
      label: "Availability not confirmed",
      detail: "The seller has not confirmed recently that this car is still for sale. Ask them before you travel to see it.",
    };
  }

  const age = now.getTime() - new Date(confirmedAt).getTime();
  const ago = `${formatDistanceToNowStrict(new Date(confirmedAt), { addSuffix: false })} ago`;
  if (age <= freshDays * DAY) {
    return { tone: "confirmed", label: "Seller confirmed available", detail: `Confirmed ${ago}. Still worth checking before you travel.` };
  }
  return {
    tone: "unconfirmed",
    label: "Needs reconfirmation",
    detail: `Last confirmed ${ago}. Ask the seller whether it is still for sale before you travel.`,
  };
};
