import type { LucideIcon } from "lucide-react";
import { Boxes, Fingerprint, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";

// The five Moatwave features Motorcars will run on. Moatwave is still being built, so on Motorcars
// each one appears only as a labelled preview; none is connected. Connection status lives in
// services/platform.ts and changes only once an API contract is confirmed with the Moatwave team.

export type MoatwaveFeatureId = "mid" | "wavechat" | "oio" | "conscience" | "argus";

export interface MoatwaveFeature {
  id: MoatwaveFeatureId;
  name: string;
  /** What the name stands for, shown beside it. */
  role: string;
  icon: LucideIcon;
  tagline: string;
  summary: string;
  forBuyers: string[];
  forDealers: string[];
  /** Where the preview appears on Motorcars. */
  seenOn: string[];
  /** What Motorcars does today in its place, said plainly. */
  today: string;
}

export const MOATWAVE_FEATURES: MoatwaveFeature[] = [
  {
    id: "mid",
    name: "MID",
    role: "Moatwave identity",
    icon: Fingerprint,
    tagline: "One identity for every business, stand and person on the platform.",
    summary:
      "Each dealer and car stand gets a Moatwave ID that carries its verified business details, its staff and its history with it, so buyers know exactly who they're dealing with.",
    forBuyers: ["See which business and which staff member you're talking to", "Know a stand's identity was checked once, by one standard"],
    forDealers: ["Register once and use the same identity across Moatwave services", "Link your sales staff to your stand"],
    seenOn: ["Dealer profiles", "Dealer dashboard"],
    today: "Motorcars reviews each dealer's CAC number and owner ID itself and shows a Verified business badge.",
  },
  {
    id: "wavechat",
    name: "WaveChat",
    role: "Conversations",
    icon: MessagesSquare,
    tagline: "Chats that keep the car in view.",
    summary:
      "Every conversation stays attached to the car it's about, with its photo, year and price. Quick actions let buyers ask if it's available, request photos, arrange an inspection or make an offer.",
    forBuyers: ["Never lose track of which car a chat is about", "Ask the common questions in one tap"],
    forDealers: ["See every enquiry with the car attached", "Staff can pick up a conversation without asking the buyer to repeat themselves"],
    seenOn: ["Every car page", "Dealer dashboard"],
    today: "Buyers contact sellers by WhatsApp, phone or the Motorcars message inbox.",
  },
  {
    id: "oio",
    name: "Open Inventory",
    role: "OIO",
    icon: Boxes,
    tagline: "Stock and availability straight from the stand's records.",
    summary:
      "A stand's cars and their availability come from its own Moatwave inventory, so when a car is reserved or sold on the stand, Motorcars shows it straight away.",
    forBuyers: ["Fewer trips to see cars that are already sold", "Availability that comes from the stand's records, not a guess"],
    forDealers: ["Update a car once and every channel shows the change", "Stop re-typing your stock into each site"],
    seenOn: ["Dealer profiles", "Dealer dashboard"],
    today: "Sellers list cars on Motorcars and confirm availability themselves.",
  },
  {
    id: "conscience",
    name: "Conscience Protocol",
    role: "Integrity",
    icon: ShieldCheck,
    tagline: "Trust built from what actually happened.",
    summary:
      "Integrity indicators built only from recorded evidence: listing updates, availability confirmations, response times, inspections, completed sales and buyer feedback. Moatwave defines how they are weighed.",
    forBuyers: ["See a seller's track record, not just their claims", "Every indicator links back to recorded events"],
    forDealers: ["Good conduct is recorded and shown", "One fair standard for every seller"],
    seenOn: ["Every car page", "Dealer dashboard"],
    today: "Motorcars shows only what it has recorded, such as the Verified business badge and listing dates. It calculates no trust score.",
  },
  {
    id: "argus",
    name: "Argus",
    role: "Intelligence",
    icon: Sparkles,
    tagline: "An assistant that helps you choose, and never makes things up.",
    summary:
      "Argus helps buyers describe what they want, compare cars, spot missing details and prepare for an inspection. It helps dealers complete their listings and summarise enquiries. It works only from real listings and never invents cars, prices or results.",
    forBuyers: ["Search in your own words", "Know what to ask before you travel to see a car"],
    forDealers: ["See what each listing is missing", "Get enquiries summarised"],
    seenOn: ["Car search", "Every car page", "Dealer dashboard"],
    today: "The previews use simple fixed rules: they read your words into filters and check which details a listing leaves out.",
  },
];

export const moatwaveFeature = (id: MoatwaveFeatureId) => MOATWAVE_FEATURES.find((feature) => feature.id === id)!;
