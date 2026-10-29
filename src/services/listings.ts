import { supabase } from "@/integrations/supabase/client";
import {
  CONDITION_VARIANTS,
  matchesTextCriteria,
  matchesVehicleType,
  relevanceScore,
  type SearchCriteria,
} from "@/lib/vehicleSearch";

// Motorcars automotive domain: vehicle listings.
// Backed by Supabase today. Listings stay a Motorcars-owned model when Moatwave is connected.

export interface ListingSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: string | null;
  location: string | null;
  mileage: number | null;
  transmission: string | null;
  createdAt: string;
  isFeatured: boolean;
  imageUrl: string | null;
}

const SUMMARY_COLUMNS =
  "id, make, model, year, price, condition, location, mileage, transmission, created_at, is_featured, car_listing_images(image_url, is_primary)";

type ListingRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: string | null;
  location: string | null;
  mileage: number | null;
  transmission: string | null;
  created_at: string;
  is_featured: boolean | null;
  car_listing_images: { image_url: string; is_primary: boolean | null }[] | null;
};

const toSummary = (row: ListingRow): ListingSummary => {
  const images = row.car_listing_images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    price: Number(row.price),
    condition: row.condition,
    location: row.location,
    mileage: row.mileage,
    transmission: row.transmission,
    createdAt: row.created_at,
    isFeatured: Boolean(row.is_featured),
    imageUrl: primary?.image_url ?? null,
  };
};

/** Admin-featured active listings whose featured period has not ended. */
export async function fetchFeaturedListings(limit = 8): Promise<ListingSummary[]> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .eq("is_featured", true)
    .or(`featured_until.is.null,featured_until.gt.${new Date().toISOString()}`)
    .order("is_top_listing", { ascending: false })
    .order("is_boosted", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as ListingRow[]).map(toSummary);
}

/** Most recently created active listings. */
export async function fetchRecentListings(limit = 8): Promise<ListingSummary[]> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as ListingRow[]).map(toSummary);
}

/** A seller's active listings, newest first. */
export async function fetchSellerListings(sellerId: string): Promise<ListingSummary[]> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .eq("user_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as ListingRow[]).map(toSummary);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** Upper bound on rows fetched per search; text matching then runs on these rows. */
export const SEARCH_LIMIT = 1000;

const SEARCH_COLUMNS = `${SUMMARY_COLUMNS}, description, fuel_type`;

type SearchRow = ListingRow & { description: string | null; fuel_type: string | null };

export interface SearchResult {
  listings: ListingSummary[];
  /** True when the database returned SEARCH_LIMIT rows, so some matches may be missing. */
  truncated: boolean;
}

const toNumber = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return value && Number.isFinite(parsed) ? parsed : null;
};

/**
 * Price, year, condition, fuel and transmission are filtered in the database.
 * Make, model, free text, location and vehicle type are matched afterwards, because
 * those fields are free text with inconsistent spellings.
 */
export async function searchListings(criteria: SearchCriteria): Promise<SearchResult> {
  let query = supabase.from("car_listings").select(SEARCH_COLUMNS).eq("status", "active");

  const minPrice = toNumber(criteria.minPrice);
  const maxPrice = toNumber(criteria.maxPrice);
  const yearFrom = toNumber(criteria.yearFrom);
  const yearTo = toNumber(criteria.yearTo);
  if (minPrice !== null) query = query.gte("price", minPrice);
  if (maxPrice !== null) query = query.lte("price", maxPrice);
  if (yearFrom !== null) query = query.gte("year", yearFrom);
  if (yearTo !== null) query = query.lte("year", yearTo);
  if (criteria.condition) query = query.in("condition", CONDITION_VARIANTS[criteria.condition] ?? [criteria.condition]);
  // ilike without wildcards is a case-insensitive exact match
  if (criteria.fuel) query = query.ilike("fuel_type", criteria.fuel);
  if (criteria.transmission) query = query.ilike("transmission", criteria.transmission);

  if (criteria.sort === "price_asc" || criteria.sort === "price_desc") {
    query = query.order("price", { ascending: criteria.sort === "price_asc" });
  }
  query = query.order("created_at", { ascending: false }).limit(SEARCH_LIMIT);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as SearchRow[];
  let matches = rows.filter((row) => matchesTextCriteria(row, criteria));
  if (criteria.sort === "relevance" && criteria.search) {
    // Array.prototype.sort is stable, so equal scores keep newest-first order
    matches = [...matches].sort((a, b) => relevanceScore(b, criteria.search) - relevanceScore(a, criteria.search));
  }

  return { listings: matches.map(toSummary), truncated: rows.length === SEARCH_LIMIT };
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

/** Price ceiling for the homepage budget collection, in naira. */
export const HOMEPAGE_BUDGET = 10_000_000;

/** Newest active listings the homepage collections are drawn from. */
const HOMEPAGE_POOL = 200;

export interface HomepageListings {
  featured: ListingSummary[];
  justListed: ListingSummary[];
  foreignUsed: ListingSummary[];
  nigerianUsed: ListingSummary[];
  underBudget: ListingSummary[];
  suvs: ListingSummary[];
}

const hasCondition = (row: SearchRow, condition: keyof typeof CONDITION_VARIANTS) =>
  CONDITION_VARIANTS[condition].some((variant) => variant.toLowerCase() === row.condition?.toLowerCase());

/**
 * Every homepage vehicle section from two queries. Sections are filled in page order and a
 * listing appears in only one of them; a collection with fewer than three cars left is empty.
 */
export async function fetchHomepageListings(): Promise<HomepageListings> {
  const [featured, pool] = await Promise.all([
    fetchFeaturedListings(8),
    supabase
      .from("car_listings")
      .select(SEARCH_COLUMNS)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(HOMEPAGE_POOL),
  ]);
  if (pool.error) throw pool.error;

  const rows = (pool.data ?? []) as unknown as SearchRow[];
  const shown = new Set(featured.map((listing) => listing.id));

  const take = (matches: (row: SearchRow) => boolean, count: number, minimum: number) => {
    const picked = rows.filter((row) => !shown.has(row.id) && matches(row)).slice(0, count);
    if (picked.length < minimum) return [];
    picked.forEach((row) => shown.add(row.id));
    return picked.map(toSummary);
  };

  return {
    featured,
    justListed: take(() => true, 9, 1),
    foreignUsed: take((row) => hasCondition(row, "foreign_used"), 4, 3),
    nigerianUsed: take((row) => hasCondition(row, "local_used"), 4, 3),
    underBudget: take((row) => Number(row.price) <= HOMEPAGE_BUDGET, 4, 3),
    suvs: take((row) => matchesVehicleType(row, "suv"), 4, 3),
  };
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export interface ListingImage {
  id: string;
  url: string;
}

export interface ListingDetail {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: string | null;
  location: string | null;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  description: string | null;
  features: string[];
  status: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
}

type DetailRow = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: string | null;
  location: string | null;
  mileage: number | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
  description: string | null;
  features: string[] | null;
  status: string;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
  car_listing_images: { id: string; image_url: string; is_primary: boolean | null }[] | null;
};

/**
 * One listing with its photos, or null when it does not exist or is not visible to this
 * visitor (database policies hide listings that are not active, except from their owner).
 */
export async function fetchListingDetail(id: string): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(
      "id, user_id, make, model, year, price, condition, location, mileage, transmission, fuel_type, color, description, features, status, is_featured, created_at, updated_at, car_listing_images(id, image_url, is_primary)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  const images = [...(row.car_listing_images ?? [])].sort(
    (a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary))
  );

  return {
    id: row.id,
    userId: row.user_id,
    make: row.make,
    model: row.model,
    year: row.year,
    price: Number(row.price),
    condition: row.condition,
    location: row.location,
    mileage: row.mileage,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    color: row.color,
    description: row.description?.trim() || null,
    features: (row.features ?? []).filter((feature) => feature?.trim()),
    status: row.status,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: images.map((image) => ({ id: image.id, url: image.image_url })),
  };
}

/** Other active listings of the same make, then in a similar price range. Empty when none exist. */
export async function fetchSimilarListings(listing: ListingDetail, limit = 4): Promise<ListingSummary[]> {
  const sameMake = await supabase
    .from("car_listings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .neq("id", listing.id)
    .ilike("make", listing.make)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (sameMake.error) throw sameMake.error;

  const results = ((sameMake.data ?? []) as unknown as ListingRow[]).map(toSummary);
  if (results.length >= limit) return results;

  const similarPrice = await supabase
    .from("car_listings")
    .select(SUMMARY_COLUMNS)
    .eq("status", "active")
    .neq("id", listing.id)
    .gte("price", Math.round(listing.price * 0.7))
    .lte("price", Math.round(listing.price * 1.3))
    .order("created_at", { ascending: false })
    .limit(limit * 2);
  if (similarPrice.error) throw similarPrice.error;

  const seen = new Set(results.map((item) => item.id));
  for (const item of ((similarPrice.data ?? []) as unknown as ListingRow[]).map(toSummary)) {
    if (results.length >= limit) break;
    if (!seen.has(item.id)) results.push(item);
  }
  return results;
}
