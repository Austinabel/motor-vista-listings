import { toStateName } from "@/lib/locations";
import { formatNaira } from "@/lib/format";
import { CAR_MAKES, EMPTY_CRITERIA, type SearchCriteria } from "@/lib/vehicleSearch";

// Simple rules that stand in for Argus until Moatwave's Argus is connected. They only read
// what the buyer typed or what the seller filled in: nothing here invents cars, prices or results.

// ── Listing completeness ─────────────────────────────────────

export interface ListingDetailsInput {
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  description: string | null;
  /** Omit when the photo count isn't known. */
  photoCount?: number;
}

/** Photos below this count are reported as too few. */
export const RECOMMENDED_PHOTOS = 5;

/** Details a buyer would expect that the seller left empty, in the order a buyer reads them. */
export const missingListingDetails = (listing: ListingDetailsInput): string[] => {
  const missing: string[] = [];
  if (listing.mileage == null) missing.push("Mileage");
  if (!listing.transmission) missing.push("Gearbox (automatic or manual)");
  if (!listing.fuelType) missing.push("Fuel type");
  if (!listing.color) missing.push("Colour");
  if (!listing.description?.trim()) missing.push("A description of the car's history and condition");
  if (listing.photoCount !== undefined && listing.photoCount < RECOMMENDED_PHOTOS) {
    missing.push(listing.photoCount === 0 ? "Photos" : `More photos (${listing.photoCount} of ${RECOMMENDED_PHOTOS} recommended)`);
  }
  return missing;
};

// ── Inspection questions ─────────────────────────────────────

const COMMON_QUESTIONS = [
  "Can I see the vehicle papers (proof of ownership, vehicle licence and roadworthiness certificate) before paying?",
  "Does the VIN on the papers match the VIN on the car's chassis and dashboard?",
  "Can I bring a mechanic and take a test drive?",
  "Has the car been in an accident or had major repairs?",
];

const CONDITION_QUESTIONS: Record<string, string[]> = {
  foreign_used: [
    "Can I see the customs duty papers for this car?",
    "Is the car already registered in Nigeria, or will I register it?",
    "Has the car had flood damage? Can I check under the carpets and seats?",
  ],
  local_used: [
    "How many owners has the car had in Nigeria?",
    "Are the service records available?",
    "When were the tyres and battery last replaced?",
  ],
  brand_new: [
    "What warranty comes with the car, and who honours it in Nigeria?",
    "Will I get the original invoice and customs papers?",
  ],
};

const conditionKey = (condition: string | null) => {
  const value = (condition ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (["foreign_used", "tokunbo"].includes(value)) return "foreign_used";
  if (["local_used", "nigerian_used"].includes(value)) return "local_used";
  if (["brand_new", "new"].includes(value)) return "brand_new";
  return null;
};

/** General questions to take to an inspection, with extra ones for the car's condition. */
export const inspectionQuestions = (condition: string | null): string[] => {
  const key = conditionKey(condition);
  return [...COMMON_QUESTIONS, ...(key ? CONDITION_QUESTIONS[key] : [])];
};

// ── Search requests in plain words ───────────────────────────

export interface InterpretedSearch {
  criteria: SearchCriteria;
  /** What was understood, as short labels to show the buyer. */
  understood: string[];
}

const MAKE_ALIASES: Record<string, string> = {
  benz: "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  vw: "Volkswagen",
  chevy: "Chevrolet",
};

const TYPE_WORDS: [RegExp, string, string][] = [
  [/\b(suvs?|4x4s?)\b/, "suv", "SUV or 4x4"],
  [/\b(sedans?|saloons?)\b/, "sedan", "Sedan"],
  [/\b(pick-?ups?)\b/, "pickups", "Pickup"],
  [/\b(bus|buses|shuttles?)\b/, "buses-shuttles", "Bus or shuttle"],
  [/\b(keke|tricycles?)\b/, "tricycles", "Tricycle"],
  [/\b(motorbikes?|okada)\b/, "motorbikes", "Motorbike"],
];

const CONDITION_WORDS: [RegExp, string, string][] = [
  [/\b(tokunbo|foreign[\s-]used)\b/, "foreign_used", "Foreign used"],
  [/\b(nigerian?[\s-]used|naija[\s-]used|locally[\s-]used|local[\s-]used)\b/, "local_used", "Nigerian used"],
  [/\b(brand[\s-]new)\b/, "brand_new", "Brand new"],
];

const FUEL_WORDS: [RegExp, string, string][] = [
  [/\bdiesel\b/, "diesel", "Diesel"],
  [/\bpetrol\b/, "petrol", "Petrol"],
  [/\bhybrid\b/, "hybrid", "Hybrid"],
  [/\belectric\b/, "electric", "Electric"],
];

const AMOUNT = String.raw`(?:₦|n|ngn)?\s*(\d[\d,]*(?:\.\d+)?)\s*(m|mil|million|k|thousand)?\b`;

const toNaira = (number: string, unit: string | undefined) => {
  const value = Number(number.replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;
  // A bare year-like number ("under 2015") is not a price
  if (!unit && value >= 1980 && value <= 2049) return null;
  if (unit && /^m/.test(unit)) return Math.round(value * 1_000_000);
  if (unit && /^(k|thousand)/.test(unit)) return Math.round(value * 1_000);
  // A bare small number in a price phrase is read as millions ("under 15")
  return value < 1000 ? Math.round(value * 1_000_000) : Math.round(value);
};

const STOP_WORDS = new Set([
  "a", "an", "the", "i", "im", "i'm", "me", "my", "want", "need", "looking", "look", "for", "find", "show", "get",
  "buy", "car", "cars", "vehicle", "vehicles", "in", "at", "around", "near", "with", "and", "or", "of", "to", "is",
  "any", "some", "please", "good", "nice", "clean", "neat", "cheap", "affordable", "budget", "price", "naira",
  "used", "condition", "that", "which", "one", "ones", "something", "like", "about", "auto", "state",
]);

/**
 * Turns a request such as "Toyota SUV under 15 million in Lagos, 2015 or newer" into search filters.
 * Words that match no rule are kept as a keyword search, so nothing the buyer typed is dropped silently.
 */
export const interpretSearchRequest = (input: string): InterpretedSearch => {
  const criteria: SearchCriteria = { ...EMPTY_CRITERIA };
  const understood: string[] = [];
  let text = ` ${input.toLowerCase().replace(/[!?;]/g, " ")} `;

  // Prices first, so their numbers aren't read as years
  const between = new RegExp(String.raw`\bbetween\s+${AMOUNT}\s*(?:and|-|to)\s*${AMOUNT}`).exec(text);
  if (between) {
    const low = toNaira(between[1], between[2] ?? between[4]);
    const high = toNaira(between[3], between[4]);
    if (low && high) {
      criteria.minPrice = String(Math.min(low, high));
      criteria.maxPrice = String(Math.max(low, high));
      understood.push(`${formatNaira(Number(criteria.minPrice))} to ${formatNaira(Number(criteria.maxPrice))}`);
      text = text.replace(between[0], " ");
    }
  }
  const max = new RegExp(String.raw`\b(?:under|below|less than|not more than|max(?:imum)?|up to|within|at most)\s+${AMOUNT}`).exec(text);
  if (max) {
    const amount = toNaira(max[1], max[2]);
    if (amount) {
      criteria.maxPrice = String(amount);
      understood.push(`Up to ${formatNaira(amount)}`);
      text = text.replace(max[0], " ");
    }
  }
  const min = new RegExp(String.raw`\b(?:over|above|more than|at least|min(?:imum)?)\s+${AMOUNT}`).exec(text);
  if (min) {
    const amount = toNaira(min[1], min[2]);
    if (amount) {
      criteria.minPrice = String(amount);
      understood.push(`From ${formatNaira(amount)}`);
      text = text.replace(min[0], " ");
    }
  }

  // Years
  const YEAR = String.raw`((?:19[89]|20[0-4])\d)`;
  const yearFrom =
    new RegExp(String.raw`\b(?:from|after|since|newer than)\s+${YEAR}\b`).exec(text) ??
    new RegExp(String.raw`\b${YEAR}\s*(?:\+|or newer|or later|and above|and newer|upwards)`).exec(text);
  if (yearFrom) {
    criteria.yearFrom = yearFrom[1];
    understood.push(`${yearFrom[1]} or newer`);
    text = text.replace(yearFrom[0], " ");
  }
  const yearTo =
    new RegExp(String.raw`\b(?:before|older than|up to)\s+${YEAR}\b`).exec(text) ??
    new RegExp(String.raw`\b${YEAR}\s*(?:or older|or earlier|and below)`).exec(text);
  if (yearTo) {
    criteria.yearTo = yearTo[1];
    understood.push(`${yearTo[1]} or older`);
    text = text.replace(yearTo[0], " ");
  }
  if (!yearFrom && !yearTo) {
    const year = new RegExp(String.raw`\b${YEAR}\b`).exec(text);
    if (year) {
      criteria.yearFrom = year[1];
      criteria.yearTo = year[1];
      understood.push(`Year ${year[1]}`);
      text = text.replace(year[0], " ");
    }
  }

  const applyWords = (rules: [RegExp, string, string][], key: "condition" | "fuel" | "category") => {
    for (const [pattern, value, label] of rules) {
      if (pattern.test(text)) {
        criteria[key] = value;
        understood.push(label);
        text = text.replace(pattern, " ");
        return;
      }
    }
  };
  applyWords(CONDITION_WORDS, "condition");
  applyWords(TYPE_WORDS, "category");
  applyWords(FUEL_WORDS, "fuel");

  if (/\b(automatic|auto gear|autogear)\b/.test(text)) {
    criteria.transmission = "automatic";
    understood.push("Automatic");
    text = text.replace(/\b(automatic|auto gear|autogear)\b/, " ");
  } else if (/\bmanual\b/.test(text)) {
    criteria.transmission = "manual";
    understood.push("Manual");
    text = text.replace(/\bmanual\b/, " ");
  }

  // Makes: longest names first so "Land Rover" wins over "Rover"
  const makes = [
    ...Object.entries(MAKE_ALIASES),
    ...CAR_MAKES.map((make) => [make.toLowerCase().replace(/-/g, " "), make] as [string, string]),
  ].sort((a, b) => b[0].length - a[0].length);
  for (const [word, make] of makes) {
    const pattern = new RegExp(String.raw`(^|[^a-z0-9])${word.replace(/\s+/g, "[\\s-]+")}(?=$|[^a-z0-9])`);
    if (pattern.test(text)) {
      criteria.make = make;
      understood.push(make);
      text = text.replace(pattern, " ");
      break;
    }
  }

  // Places: two-word names first ("port harcourt", "akwa ibom"), then single words
  const words = text.split(/[^a-z0-9'-]+/).filter(Boolean);
  const phrases = [
    ...words.slice(0, -1).map((word, index) => `${word} ${words[index + 1]}`),
    ...words,
  ];
  for (const phrase of phrases) {
    const state = toStateName(phrase);
    if (state) {
      criteria.location = state;
      understood.push(state === "FCT" ? "Abuja (FCT)" : state);
      text = ` ${text} `.replace(new RegExp(String.raw`(^|[^a-z0-9])${phrase}(?=$|[^a-z0-9])`), " ");
      break;
    }
  }

  const leftover = text
    .split(/[^a-z0-9'-]+/)
    .filter((word) => word && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
  if (leftover.length > 0) {
    criteria.search = leftover.join(" ");
    criteria.sort = "relevance";
    understood.push(`Keyword: “${criteria.search}”`);
  }

  return { criteria, understood };
};
