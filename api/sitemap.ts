// /sitemap.xml (rewritten here by vercel.json): public pages, active listings and approved
// car stands, read with the public (anon) key so only public data can appear.
import { STATIC_PATHS, sitemapXml, type SitemapEntry } from "./_lib/share";

export const config = { runtime: "edge" };

const fetchRows = async (supabaseUrl: string, anonKey: string, path: string) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  return response.ok ? response.json() : [];
};

export default async function handler(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (supabaseUrl && anonKey) {
    try {
      const [listings, dealers] = await Promise.all([
        fetchRows(supabaseUrl, anonKey, "car_listings?select=id,updated_at&status=eq.active&order=updated_at.desc&limit=5000"),
        fetchRows(supabaseUrl, anonKey, "rpc/get_public_dealers?select=id"),
      ]);
      for (const listing of listings) entries.push({ path: `/cars/${listing.id}`, lastModified: listing.updated_at });
      for (const dealer of dealers) entries.push({ path: `/dealer/${dealer.id}` });
    } catch {
      // Serve the static pages alone rather than fail
    }
  }

  return new Response(sitemapXml(origin, entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" },
  });
}
