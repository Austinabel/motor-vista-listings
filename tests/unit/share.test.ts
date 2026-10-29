import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, listingPreviewHtml, sitemapXml } from "../../api/_lib/share";

const listing = {
  id: "ae795e76-6d6e-44f3-ab92-0cc93c8e459a",
  year: 2012,
  make: "Toyota",
  model: "Sienna",
  price: 18500000,
  location: "Onitsha, Anambra",
  imageUrl: "https://example.supabase.co/storage/v1/object/public/car-listing-images/a.jpg",
};

test("listing preview carries title, price, image and canonical URL", () => {
  const html = listingPreviewHtml(listing, "https://motorcars.ng", `/cars/${listing.id}`);
  assert.match(html, /<meta property="og:title" content="2012 Toyota Sienna for ₦18,500,000 in Onitsha, Anambra">/);
  assert.match(html, /og:image" content="https:\/\/example\.supabase\.co/);
  assert.match(html, /<link rel="canonical" href="https:\/\/motorcars\.ng\/cars\/ae795e76/);
});

test("listing text is escaped so it cannot inject markup", () => {
  const html = listingPreviewHtml({ ...listing, model: '<script>alert("x")</script>' }, "https://motorcars.ng", "/cars/x");
  assert.equal(html.includes("<script>"), false);
  assert.equal(escapeHtml('"<&>\''), "&quot;&lt;&amp;&gt;&#39;");
});

test("missing listing falls back to the generic site preview", () => {
  const html = listingPreviewHtml(null, "https://motorcars.ng", "/cars/unknown");
  assert.match(html, /Real Dealers\. Real Cars\. Live Stands\./);
  assert.match(html, /hero-suv\.webp/);
});

test("sitemap lists URLs with dates", () => {
  const xml = sitemapXml("https://motorcars.ng", [{ path: "/" }, { path: "/cars/1", lastModified: "2026-10-01T10:00:00Z" }]);
  assert.match(xml, /<loc>https:\/\/motorcars\.ng\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/motorcars\.ng\/cars\/1<\/loc><lastmod>2026-10-01<\/lastmod>/);
});
