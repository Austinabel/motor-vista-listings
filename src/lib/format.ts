import { formatDistanceToNowStrict } from "date-fns";

const nairaFormatter = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** ₦4,800,000 */
export const formatNaira = (amount: number) => `₦${nairaFormatter.format(amount)}`;

/** 45,000 km */
export const formatMileage = (km: number) => `${nairaFormatter.format(km)} km`;

/** "3 days ago" */
export const formatListedAgo = (isoDate: string) =>
  `${formatDistanceToNowStrict(new Date(isoDate))} ago`;

const CONDITION_LABELS: Record<string, string> = {
  brand_new: "Brand new",
  "brand-new": "Brand new",
  new: "Brand new",
  foreign_used: "Foreign used",
  "foreign-used": "Foreign used",
  tokunbo: "Foreign used",
  local_used: "Nigerian used",
  "local-used": "Nigerian used",
  nigerian_used: "Nigerian used",
  "nigerian-used": "Nigerian used",
};

/** "12 Oct 2026" */
export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

/**
 * International digits for a wa.me link: "0803 123 4567" becomes "2348031234567".
 * Returns null when the number cannot be a Nigerian or international mobile number.
 */
export const toWhatsAppNumber = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, "");
  if (/^0\d{10}$/.test(digits)) return `234${digits.slice(1)}`;
  if (/^234\d{10}$/.test(digits)) return digits;
  if (phone.trim().startsWith("+") && digits.length >= 10 && digits.length <= 15) return digits;
  return null;
};

/** "Automatic" from "automatic" */
export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Normalises the several condition spellings stored in car_listings. */
export const formatCondition = (condition: string | null) =>
  condition ? CONDITION_LABELS[condition.toLowerCase()] ?? condition : null;
