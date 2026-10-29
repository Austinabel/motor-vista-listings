/**
 * A post-sign-in destination from ?redirect=, accepted only when it is a path on this site.
 * Anything else (another domain, "//host", "javascript:") returns null, so the parameter
 * cannot send users off-site.
 */
export const safeRedirectPath = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f]/.test(value)) return null;
  // Never bounce back to an auth page
  if (/^\/(login|register|forgot-password)(\/|\?|$)/.test(value)) return null;
  return value;
};

/** The sign-in link for a page, carrying that page as the return destination. */
export const loginPathFor = (returnTo: string) => `/login?redirect=${encodeURIComponent(returnTo)}`;
