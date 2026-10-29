import { locationMatches } from "@/lib/locations";

// Search criteria for /cars, read from and written to the URL so results survive
// navigation, refresh and sharing.

export type SortOption = "newest" | "price_asc" | "price_desc" | "relevance";

export interface SearchCriteria {
  search: string;
  make: string;
  model: string;
  category: string;
  condition: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  yearFrom: string;
  yearTo: string;
  fuel: string;
  transmission: string;
  sort: SortOption;
}

export const EMPTY_CRITERIA: SearchCriteria = {
  search: "",
  make: "",
  model: "",
  category: "",
  condition: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  yearFrom: "",
  yearTo: "",
  fuel: "",
  transmission: "",
  sort: "newest",
};

export const VEHICLE_TYPES = [
  { id: "suv", label: "SUVs & 4x4s" },
  { id: "sedan", label: "Sedans" },
  { id: "pickups", label: "Pickups" },
  { id: "electric-cars", label: "Electric & hybrid" },
  { id: "trucks", label: "Trucks & pickups" },
  { id: "buses-shuttles", label: "Buses & shuttles" },
  { id: "tricycles", label: "Tricycles (Keke)" },
  { id: "motorbikes", label: "Motorbikes" },
];

// Canonical condition values, as the homepage search sends them
export const CONDITIONS = [
  { id: "brand_new", label: "Brand new" },
  { id: "foreign_used", label: "Foreign used (Tokunbo)" },
  { id: "local_used", label: "Nigerian used" },
];

/** Every spelling stored in car_listings.condition for each canonical condition. */
export const CONDITION_VARIANTS: Record<string, string[]> = {
  brand_new: ["brand_new", "brand-new", "new", "Brand New", "brand new"],
  foreign_used: ["foreign_used", "foreign-used", "tokunbo", "Foreign Used", "foreign used"],
  local_used: ["local_used", "local-used", "nigerian_used", "nigerian-used", "Nigerian Used", "nigerian used", "local used"],
};

// Values the sell form stores
export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol" },
  { id: "diesel", label: "Diesel" },
  { id: "hybrid", label: "Hybrid" },
  { id: "electric", label: "Electric" },
];

export const TRANSMISSIONS = [
  { id: "automatic", label: "Automatic" },
  { id: "manual", label: "Manual" },
];

// Make list carried over from the previous search page
export const CAR_MAKES = [
  "Acura", "Audi", "Bestune", "BMW", "Brilliance", "Buick", "Cadillac", "Changan", "Chevrolet", "Chrysler",
  "Daihatsu", "Dodge", "Ford", "GAC", "GMC", "Honda", "Hyundai", "Infiniti", "Innoson", "IVM", "Jeep", "Kia",
  "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot",
  "Pontiac", "Porsche", "Renault", "Rover", "Saturn", "Scion", "Subaru", "Suzuki", "Toyota", "Volkswagen", "Volvo",
];

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "relevance", label: "Best match for your search" },
];

// Make slugs used by homepage and navigation links (?category=toyota)
const MAKE_SLUGS: Record<string, string> = {
  toyota: "Toyota", honda: "Honda", "mercedes-benz": "Mercedes-Benz", mercedes: "Mercedes-Benz", bmw: "BMW",
  audi: "Audi", lexus: "Lexus", nissan: "Nissan", hyundai: "Hyundai", ford: "Ford", volkswagen: "Volkswagen",
  peugeot: "Peugeot", kia: "Kia", innoson: "Innoson", suzuki: "Suzuki", tvs: "TVS", acura: "Acura",
  chevrolet: "Chevrolet", jeep: "Jeep", "land-rover": "Land Rover", mitsubishi: "Mitsubishi", mazda: "Mazda",
  subaru: "Subaru", infiniti: "Infiniti", cadillac: "Cadillac", lincoln: "Lincoln", porsche: "Porsche",
  mini: "Mini", opel: "Opel", renault: "Renault", volvo: "Volvo",
};

const CONDITION_SLUGS: Record<string, string> = {
  "brand-new": "brand_new", brand_new: "brand_new",
  "foreign-used": "foreign_used", foreign_used: "foreign_used", tokunbo: "foreign_used",
  "local-used": "local_used", local_used: "local_used", "nigerian-used": "local_used", nigerian_used: "local_used",
};

const VEHICLE_TYPE_SLUGS: Record<string, string> = {
  suv: "suv", suvs: "suv", sedan: "sedan", sedans: "sedan", pickups: "pickups", pickup: "pickups",
  "electric-cars": "electric-cars", electric: "electric-cars",
  trucks: "trucks", tricycles: "tricycles", motorbikes: "motorbikes",
  "buses-shuttles": "buses-shuttles", buses: "buses-shuttles",
};

const SORTS = new Set<SortOption>(["newest", "price_asc", "price_desc", "relevance"]);

/**
 * Reads criteria from the URL. Older links put makes, conditions and vehicle types in
 * ?category=, ?brand=, ?type= or ?categories=; those are folded into the matching field.
 */
export const parseCriteria = (params: URLSearchParams): SearchCriteria => {
  const criteria: SearchCriteria = { ...EMPTY_CRITERIA };
  (Object.keys(EMPTY_CRITERIA) as (keyof SearchCriteria)[]).forEach((key) => {
    const value = params.get(key);
    if (value && key !== "sort" && key !== "category") criteria[key] = value.trim();
  });
  if (params.get("fuelType")) criteria.fuel = params.get("fuelType")!.trim();

  const legacy = [params.get("category"), params.get("brand"), params.get("type"), ...(params.get("categories")?.split(",") ?? [])]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase());

  for (const slug of legacy) {
    if (VEHICLE_TYPE_SLUGS[slug] && !criteria.category) criteria.category = VEHICLE_TYPE_SLUGS[slug];
    else if (CONDITION_SLUGS[slug] && !criteria.condition) criteria.condition = CONDITION_SLUGS[slug];
    else if (MAKE_SLUGS[slug] && !criteria.make) criteria.make = MAKE_SLUGS[slug];
  }

  if (criteria.condition) criteria.condition = CONDITION_SLUGS[criteria.condition.toLowerCase()] ?? criteria.condition;

  const sort = params.get("sort") as SortOption | null;
  criteria.sort = sort && SORTS.has(sort) ? sort : criteria.search ? "relevance" : "newest";
  if (criteria.sort === "relevance" && !criteria.search) criteria.sort = "newest";
  return criteria;
};

/** Writes criteria back to URL parameters, omitting empty values and the default sort. */
export const criteriaToParams = (criteria: SearchCriteria): URLSearchParams => {
  const params = new URLSearchParams();
  (Object.keys(criteria) as (keyof SearchCriteria)[]).forEach((key) => {
    const value = criteria[key];
    if (!value) return;
    if (key === "sort" && value === (criteria.search ? "relevance" : "newest")) return;
    params.set(key, value);
  });
  return params;
};

/** Number of filters the buyer has set, excluding sort. */
export const activeFilterCount = (criteria: SearchCriteria) =>
  (Object.keys(criteria) as (keyof SearchCriteria)[]).filter((key) => key !== "sort" && criteria[key]).length;

const normaliseMake = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

const MAKE_ALIASES: Record<string, string[]> = {
  mercedesbenz: ["mercedes", "benz"],
  volkswagen: ["vw"],
  chevrolet: ["chevy"],
  landrover: ["rangerover"],
};

export const makeMatches = (listingMake: string | null | undefined, wanted: string) => {
  if (!wanted) return true;
  if (!listingMake) return false;
  const have = normaliseMake(listingMake);
  const want = normaliseMake(wanted);
  if (have.includes(want) || want.includes(have)) return true;
  return (MAKE_ALIASES[want] ?? []).some((alias) => have.includes(alias));
};

interface Matchable {
  make: string | null;
  model: string | null;
  year: number | null;
  location: string | null;
  description: string | null;
  fuel_type: string | null;
}

const contains = (text: string | null | undefined, ...words: string[]) => {
  const lower = text?.toLowerCase() ?? "";
  return words.some((word) => lower.includes(word));
};

// car_listings has no body-type column, so SUVs, sedans and pickups are recognised by model name.
// Lists cover models common in Nigeria; a model not listed simply does not appear under the type.
const SUV_MODELS = [
  "rav4", "highlander", "land cruiser", "landcruiser", "prado", "fortuner", "4runner", "sequoia", "venza", "fj cruiser",
  "rx", "gx", "lx", "nx", "ux", "cr-v", "crv", "pilot", "hr-v", "hrv", "passport", "santa fe", "tucson", "creta", "palisade",
  "sportage", "sorento", "telluride", "seltos", "explorer", "escape", "edge", "expedition", "ecosport", "everest",
  "pathfinder", "murano", "x-trail", "xtrail", "rogue", "armada", "patrol", "qashqai", "juke", "kicks",
  "x1", "x3", "x5", "x6", "x7", "gle", "glk", "gla", "glc", "gls", "ml", "g-class", "g wagon", "g-wagon",
  "q3", "q5", "q7", "q8", "range rover", "discovery", "defender", "evoque", "cayenne", "macan",
  "tiguan", "touareg", "pajero", "outlander", "montero", "cx-5", "cx5", "cx-9", "cx9", "forester", "outback",
  "grand vitara", "vitara", "jimny", "wrangler", "grand cherokee", "cherokee", "compass", "tahoe", "suburban",
  "traverse", "equinox", "escalade", "qx60", "qx80", "qx56", "fx35", "mdx", "rdx", "terrain", "acadia",
];

const SEDAN_MODELS = [
  "corolla", "camry", "avalon", "yaris", "accord", "civic", "city", "elantra", "sonata", "accent", "azera",
  "optima", "k5", "rio", "cerato", "forte", "altima", "sentra", "maxima", "sunny", "almera", "es 350", "es350",
  "is 250", "is250", "gs", "ls", "c-class", "c300", "c200", "e-class", "e350", "e300", "s-class",
  "3 series", "5 series", "7 series", "320i", "328i", "530i", "a4", "a6", "a8", "passat", "jetta", "golf",
  "mazda6", "mazda 6", "mazda3", "mazda 3", "malibu", "cruze", "impala", "fusion", "focus", "taurus",
  "406", "407", "508", "301", "tlx", "tl", "tsx", "ilx", "g35", "g37", "q50", "legacy", "impreza",
];

const PICKUP_MODELS = [
  "hilux", "tacoma", "tundra", "ranger", "f-150", "f150", "navara", "frontier", "titan", "l200", "triton",
  "d-max", "dmax", "amarok", "ridgeline", "silverado", "colorado", "ram", "gladiator", "bt-50", "landtrek",
];

const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole words, optionally followed by an engine size: "rx" matches "RX 350" and "RX350"
const modelPatterns = new Map<string[], RegExp>();
const modelIn = (model: string | null | undefined, list: string[]) => {
  let pattern = modelPatterns.get(list);
  if (!pattern) {
    pattern = new RegExp(`(^| )(${list.map(escapePattern).join("|")})\\d*( |$)`);
    modelPatterns.set(list, pattern);
  }
  return pattern.test((model ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, " ").trim());
};

// Ported from the previous CarListings rules: vehicle types are inferred from make, model and fuel
export const matchesVehicleType = (car: Matchable, type: string) => {
  const { make, model } = car;
  const fuel = car.fuel_type?.toLowerCase();
  switch (type) {
    case "suv":
      return modelIn(model, SUV_MODELS);
    case "sedan":
      return modelIn(model, SEDAN_MODELS);
    case "pickups":
      return modelIn(model, PICKUP_MODELS);
    case "electric-cars":
      return fuel === "electric" || fuel === "hybrid" || contains(model, "electric", "tesla", " ev", "e-tron") || contains(make, "tesla");
    case "tricycles":
      return contains(make, "bajaj", "piaggio") || contains(model, "tricycle", "keke", "tuk", "trike", "ape");
    case "trucks":
      return contains(make, "daf", "scania", "iveco", "hino", "sinotruk", "howo") ||
        /\bman\b/i.test(make ?? "") ||
        contains(model, "truck", "tipper", "trailer", "lorry", "pickup", "pick-up", "hilux", "tundra", "f-150", "ranger", "navara");
    case "motorbikes":
      return contains(make, "yamaha", "kawasaki", "ducati", "harley", "qlink", "haojue") ||
        contains(model, "bike", "motorcycle", "cbr", "ninja", "pulsar", "boxer");
    case "buses-shuttles":
      return contains(model, "bus", "hiace", "coaster", "shuttle", "transit", "sprinter", "crafter", "sienna");
    default:
      return true;
  }
};

const keywordWords = (search: string) => search.toLowerCase().split(/\s+/).filter(Boolean);

/** Every word of the free-text search must appear in make, model, year, location or description. */
export const matchesKeyword = (car: Matchable, search: string) => {
  const words = keywordWords(search);
  if (words.length === 0) return true;
  const haystack = [car.make, car.model, car.year, car.location, car.description].filter(Boolean).join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/** Higher when the search words hit the make, model and year rather than the description. */
export const relevanceScore = (car: Matchable, search: string) =>
  keywordWords(search).reduce((score, word) => {
    if (contains(car.make, word) || contains(car.model, word)) return score + 3;
    if (String(car.year ?? "") === word) return score + 2;
    if (contains(car.location, word)) return score + 1;
    return score;
  }, 0);

/** Text-based criteria that the database query cannot express reliably. */
export const matchesTextCriteria = (car: Matchable, criteria: SearchCriteria) =>
  makeMatches(car.make, criteria.make) &&
  (!criteria.model || contains(car.model, criteria.model.toLowerCase())) &&
  matchesKeyword(car, criteria.search) &&
  locationMatches(car.location, criteria.location) &&
  (!criteria.category || matchesVehicleType(car, criteria.category));
