import { useEffect } from "react";

const SITE = "Motorcars";
const DEFAULT_DESCRIPTION = "Find cars from real dealers and car stands across Nigeria. Powered by Moatwave.";

const setMeta = (attribute: "name" | "property", key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
};

interface PageMeta {
  /** Page-specific part of the title; the site name is appended. Omit for the homepage. */
  title?: string;
  description?: string;
  image?: string | null;
  /** Ask search engines not to index this page (account and admin pages). */
  noIndex?: boolean;
}

/**
 * Sets the document title, description, social preview tags and canonical URL for the
 * current page. Link-preview bots that do not run JavaScript get listing previews from
 * api/listing-preview.ts instead.
 */
export const usePageMeta = ({ title, description, image, noIndex }: PageMeta) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Real Dealers. Real Cars. Live Stands.`;
    const text = description ?? DEFAULT_DESCRIPTION;
    document.title = fullTitle;
    setMeta("name", "description", text);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", text);
    setMeta("property", "og:url", window.location.href);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    setCanonical(`${window.location.origin}${window.location.pathname}`);
  }, [title, description, image, noIndex]);
};
