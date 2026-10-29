// Link previews for shared listings. WhatsApp, Facebook, X and similar bots do not run
// JavaScript, so vercel.json routes their requests for /cars/:id here. People and search
// engines get the normal app. Reads public data only, with the public (anon) key.
import { listingPreviewHtml, type PreviewListing } from "./_lib/share";

export const config = { runtime: "edge" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id") ?? "";
  const path = `/cars/${encodeURIComponent(id)}`;

  let listing: PreviewListing | null = null;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (UUID.test(id) && supabaseUrl && anonKey) {
    const query = new URLSearchParams({
      select: "id,year,make,model,price,location,car_listing_images(image_url,is_primary)",
      id: `eq.${id}`,
      status: "eq.active",
    });
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/car_listings?${query}`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      });
      const rows = response.ok ? await response.json() : [];
      const row = rows[0];
      if (row) {
        const images: { image_url: string; is_primary: boolean | null }[] = row.car_listing_images ?? [];
        listing = {
          id: row.id,
          year: row.year,
          make: row.make,
          model: row.model,
          price: Number(row.price),
          location: row.location,
          imageUrl: (images.find((image) => image.is_primary) ?? images[0])?.image_url ?? null,
        };
      }
    } catch {
      // Fall back to the generic site preview
    }
  }

  return new Response(listingPreviewHtml(listing, requestUrl.origin, path), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
