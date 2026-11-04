// The MID rule from the Moatwave PRD (Section 5): the business phone number with its leading 0
// removed, digits reversed. 07038259694 → 7038259694 → 4969528307. Mirrors mid_from_phone() in the
// database, which is what actually issues MIDs; this copy only lets screens show the number ahead.

export const midFromPhone = (phone: string | null | undefined): string | null => {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (/^234\d{10}$/.test(digits)) digits = digits.slice(3);
  else if (/^0\d{10}$/.test(digits)) digits = digits.slice(1);
  if (!/^[1-9]\d{9}$/.test(digits)) return null;
  return [...digits].reverse().join("");
};

/** Share of the 0–1000 ring that is filled. */
export const ringFraction = (score: number) => Math.min(1, Math.max(0, score / 1000));

/** A MID in grouped form for reading aloud: 4969 528 307. */
export const formatMid = (mid: string) => mid.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
