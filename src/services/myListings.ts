import { supabase } from "@/integrations/supabase/client";
import { parseMileage } from "@/lib/format";
import { LISTING_LIFECYCLE } from "@/config/features";
import type { AvailabilityStatus } from "@/services/listings";

// A seller managing their own listings. Database policies limit every query here to rows the
// signed-in user owns; guard triggers stop them changing moderation, plan or promotion fields.

export interface MyListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string | null;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  imageUrl: string | null;
  availabilityStatus: AvailabilityStatus | null;
  availabilityConfirmedAt: string | null;
}

const LIFECYCLE_COLUMNS = LISTING_LIFECYCLE ? ", availability_status, availability_confirmed_at" : "";
const MY_COLUMNS =
  `id, make, model, year, price, location, mileage, transmission, fuel_type, color, description, status, created_at, expires_at${LIFECYCLE_COLUMNS}, car_listing_images(image_url, is_primary)`;

type MyRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string | null;
  mileage: string | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
  description: string | null;
  status: string;
  created_at: string;
  expires_at: string | null;
  availability_status?: AvailabilityStatus;
  availability_confirmed_at?: string | null;
  car_listing_images: { image_url: string; is_primary: boolean | null }[] | null;
};

const toMyListing = (row: MyRow): MyListing => {
  const images = row.car_listing_images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];
  return {
    id: row.id,
    title: `${row.year} ${row.make} ${row.model}`,
    make: row.make,
    model: row.model,
    year: row.year,
    price: Number(row.price),
    location: row.location,
    mileage: parseMileage(row.mileage),
    transmission: row.transmission,
    fuelType: row.fuel_type,
    color: row.color,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    imageUrl: primary?.image_url ?? null,
    availabilityStatus: row.availability_status ?? null,
    availabilityConfirmedAt: row.availability_confirmed_at ?? null,
  };
};

/** Every listing the user owns, in any moderation state, newest first. */
export async function fetchMyListings(userId: string): Promise<MyListing[]> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(MY_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as MyRow[]).map(toMyListing);
}

/** One of the user's own listings, or null when it does not exist or belongs to someone else. */
export async function fetchMyListing(id: string, userId: string): Promise<MyListing | null> {
  const { data, error } = await supabase
    .from("car_listings")
    .select(MY_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toMyListing(data as unknown as MyRow) : null;
}

/** Fields a seller may edit after listing. Make, model and year identify the approved car and stay fixed. */
export interface ListingEdit {
  price: number;
  mileage: number | null;
  location: string;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  description: string | null;
}

export async function updateMyListing(id: string, userId: string, edit: ListingEdit): Promise<void> {
  const { error } = await supabase
    .from("car_listings")
    .update({
      price: edit.price,
      // Stored as text in car_listings
      mileage: edit.mileage != null ? String(edit.mileage) : null,
      location: edit.location,
      transmission: edit.transmission,
      fuel_type: edit.fuelType,
      color: edit.color,
      description: edit.description,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Marks a listing available, reserved, sold or unavailable; the database stamps the time. */
export async function setListingAvailability(id: string, userId: string, status: AvailabilityStatus): Promise<void> {
  const { error } = await supabase
    .from("car_listings")
    .update({ availability_status: status })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Confirms the car is still for sale. The value sent is replaced with the database's own time. */
export async function confirmListingAvailability(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("car_listings")
    .update({ availability_confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Extends the listing by its plan duration; returns the new expiry date. */
export async function renewListing(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("renew_listing", { listing_id: id });
  if (error) throw error;
  return data;
}
