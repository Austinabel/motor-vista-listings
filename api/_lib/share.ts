// Pure builders for link previews and the sitemap, shared by the Vercel functions and tests.

export const SITE_NAME = "Motorcars";
export const SITE_TAGLINE = "Real Dealers. Real Cars. Live Stands.";

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const naira = (amount: number) => `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount)}`;

export interface PreviewListing {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  location: string | null;
  imageUrl: string | null;
}

/** Minimal HTML carrying Open Graph tags for a listing, for link-preview bots that do not run JavaScript. */
export const listingPreviewHtml = (listing: PreviewListing | null, origin: string, path: string) => {
  const url = `${origin}${path}`;
  const title = listing
    ? `${listing.year} ${listing.make} ${listing.model} for ${naira(listing.price)}${listing.location ? ` in ${listing.location}` : ""}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const description = listing
    ? `See photos and contact the seller on ${SITE_NAME}.`
    : "Find cars from real dealers and car stands across Nigeria.";
  const image = listing?.imageUrl ?? `${origin}/images/home/hero-suv.webp`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} | ${SITE_NAME}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${escapeHtml(url)}">
</head>
<body><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></body>
</html>`;
};

export interface SitemapEntry {
  path: string;
  lastModified?: string;
}

/** Public pages that are always in the sitemap. Account, admin and edit pages are excluded. */
export const STATIC_PATHS = ["/", "/cars", "/dealers", "/sell", "/about", "/help", "/contact", "/terms", "/privacy"];

export const sitemapXml = (origin: string, entries: SitemapEntry[]) => {
  const urls = entries
    .map(({ path, lastModified }) => {
      const lastmod = lastModified ? `<lastmod>${escapeHtml(lastModified.slice(0, 10))}</lastmod>` : "";
      return `  <url><loc>${escapeHtml(`${origin}${path}`)}</loc>${lastmod}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};
