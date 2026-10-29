import { NIGERIAN_STATES } from "@/lib/nigeria";

// Listing locations are free text ("Wuse, Abuja", "Ikeja, Lagos", "Port Harcourt").
// A state filter matches the state's own name plus a short list of unambiguous names for
// its capital, major cities and well-known districts. Matching is whole-word only, so a
// short name never matches inside a longer word.
const STATE_ALIASES: Record<string, string[]> = {
  FCT: ["fct", "abuja", "federal capital territory", "wuse", "garki", "maitama", "asokoro", "gwarinpa", "jabi", "kubwa", "lugbe"],
  Lagos: ["lagos", "ikeja", "lekki", "ikoyi", "victoria island", "surulere", "yaba", "ikorodu", "ajah", "festac", "apapa", "gbagada", "magodo"],
  Rivers: ["rivers", "port harcourt", "obio-akpor"],
  Oyo: ["oyo", "ibadan", "ogbomosho"],
  Ogun: ["ogun", "abeokuta", "ijebu ode", "sango ota"],
  Anambra: ["anambra", "onitsha", "awka", "nnewi"],
  Delta: ["delta state", "warri", "asaba", "sapele"],
  Edo: ["edo", "benin city"],
  Enugu: ["enugu", "nsukka"],
  Kano: ["kano"],
  Kaduna: ["kaduna", "zaria"],
  Imo: ["imo", "owerri"],
  Abia: ["abia", "umuahia", "aba"],
  "Akwa Ibom": ["akwa ibom", "uyo"],
  "Cross River": ["cross river", "calabar"],
  Kwara: ["kwara", "ilorin"],
  Plateau: ["plateau", "jos"],
  Osun: ["osun", "osogbo"],
  Ondo: ["ondo", "akure"],
  Ekiti: ["ekiti", "ado ekiti"],
  Kogi: ["kogi", "lokoja"],
  Niger: ["niger state", "minna"],
  Benue: ["benue", "makurdi"],
  Borno: ["borno", "maiduguri"],
  Nasarawa: ["nasarawa", "lafia"],
  Bayelsa: ["bayelsa", "yenagoa"],
  Ebonyi: ["ebonyi", "abakaliki"],
};

const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‐-―]/g, "-")
    .replace(/[^a-z0-9-]+/g, " ")
    .trim();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wholeWordPattern = (phrases: string[]) =>
  new RegExp(`(^|[^a-z0-9])(${phrases.map((p) => escapeRegExp(normalise(p))).join("|")})(?=$|[^a-z0-9])`);

const patternCache = new Map<string, RegExp>();

/** The canonical state name for a filter value, or null when it is not a known state or alias. */
export const toStateName = (value: string): string | null => {
  const wanted = normalise(value);
  if (!wanted) return null;
  const exact = NIGERIAN_STATES.find((state) => normalise(state) === wanted);
  if (exact) return exact;
  const byAlias = Object.entries(STATE_ALIASES).find(([, aliases]) => aliases.some((a) => normalise(a) === wanted));
  return byAlias ? byAlias[0] : null;
};

/**
 * True when a listing's free-text location falls in the place the buyer asked for.
 * Known states and their aliases match each other ("FCT" matches "Garki, Abuja");
 * any other text matches as whole words.
 */
export const locationMatches = (listingLocation: string | null | undefined, wanted: string): boolean => {
  if (!wanted.trim()) return true;
  if (!listingLocation) return false;

  const state = toStateName(wanted);
  const key = state ?? `text:${normalise(wanted)}`;
  let pattern = patternCache.get(key);
  if (!pattern) {
    const phrases = state ? [state, ...(STATE_ALIASES[state] ?? [])] : [wanted];
    pattern = wholeWordPattern(phrases);
    patternCache.set(key, pattern);
  }
  return pattern.test(normalise(listingLocation));
};
