// Shared capabilities that Moatwave will provide to Motorcars.
// None is connected yet: each entry records what Motorcars uses today.
// Switch an entry to Moatwave only after its API contract is confirmed with the Moatwave team.

export type CapabilityProvider = "supabase" | "in-app" | "whatsapp" | "moatwave" | "unavailable";

export interface PlatformCapability {
  provider: CapabilityProvider;
  /** True only when the capability is served by a confirmed Moatwave API. */
  moatwaveConnected: boolean;
  note: string;
}

export const platformCapabilities = {
  identity: {
    provider: "supabase",
    moatwaveConnected: false,
    note: "Supabase Auth; Moatwave MID later",
  },
  messaging: {
    provider: "in-app",
    moatwaveConnected: false,
    note: "In-app chat and WhatsApp links; WaveChat later",
  },
  notifications: {
    provider: "supabase",
    moatwaveConnected: false,
    note: "In-app notifications table; Moatwave notifications later",
  },
  inventory: {
    provider: "supabase",
    moatwaveConnected: false,
    note: "Listings and seller-confirmed availability in car_listings; Open Inventory (OIO) later",
  },
  integrity: {
    provider: "supabase",
    moatwaveConnected: false,
    note: "14-day cycles built from recorded events, run in Motorcars' own database; Moatwave's Conscience Protocol later",
  },
  intelligence: {
    provider: "in-app",
    moatwaveConnected: false,
    note: "Claude through the argus server function, capped, falling back to fixed rules in lib/argus.ts; Moatwave's Argus later",
  },
  serviceDirectory: {
    provider: "unavailable",
    moatwaveConnected: false,
    note: "No auto-service providers are onboarded yet",
  },
} satisfies Record<string, PlatformCapability>;
