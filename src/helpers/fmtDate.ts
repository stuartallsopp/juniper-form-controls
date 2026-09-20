import dayjs from "dayjs";

/**
 * Format an ISO timestamp as "1 Jul 2026".
 *
 * **The house format, and the only place it is written down.** `D MMM
 * YYYY` — the same one the dayjs call sites across both apps already
 * produce, which is why this is dayjs rather than `Intl`: en-GB's short
 * month for September is "Sept", four letters, so an `Intl` date sat
 * beside a dayjs one read "10 Sept 2026" against "10 Sep 2026" on the
 * same screen. One of the two had to give, and the standard in the
 * frontend guidelines is this one.
 *
 * Pinned regardless of the operator's runtime locale: the audience is
 * UK payroll bureau and their UK clients, and a US-locale browser
 * rendering "Jul 1, 2026" is the same inconsistency by another route.
 *
 * Null / empty inputs render an em-dash; unparseable ones are handed
 * back untouched, so a malformed value shows itself rather than hiding
 * behind "Invalid Date".
 */
export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = dayjs(iso);
  if (!d.isValid()) return iso;
  return d.format("D MMM YYYY");
};
