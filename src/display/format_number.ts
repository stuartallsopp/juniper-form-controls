/**
 * Plain-string number formatter — same Intl.NumberFormat under the
 * hood as the FormattedNumber React component, lifted out so it
 * can be composed into strings (e.g. "£37,000.00 (£25,830.46)")
 * where a React element wouldn't fit.
 *
 * Default locale is en-GB to match the UK payroll surface — gives
 * "37,000.00" with comma thousands and dot decimal. Pass a
 * different locale per-call if needed.
 *
 * Returns an empty string for null / undefined / NaN so callers
 * can splice it into template literals without `??` guards.
 */
export type FormatNumberOptions = {
  locale?: string;
  /** Pinned precision — the number is padded and rounded to it. */
  decimals?: number;
  /**
   * A ceiling instead of a pin, for numbers whose precision is
   * theirs rather than the surface's: 17.5 hours stays "17.5" and a
   * rate of 0.45 keeps both places, where a pinned 2 would write
   * "17.50" the form never showed. Ignored when `decimals` is given.
   */
  maximumDecimals?: number;
  prefix?: string;
  suffix?: string;
  /**
   * ISO currency code — 'GBP'. Switches to Intl's currency style,
   * which places the symbol itself and, crucially, puts a minus sign
   * OUTSIDE it: -£500.00, where a '£' prefix would give £-500.00.
   *
   * That is why this exists rather than everyone passing prefix: '£'.
   * Anywhere a figure can go negative — a reversal, an adjustment, a
   * ledger — the prefix form reads as a typo.
   *
   * `decimals` still applies on top: GBP defaults to 2, and
   * `decimals: 0` gives whole pounds.
   */
  currency?: string;
};

export const format_number = (
  value: number | string | null | undefined,
  options: FormatNumberOptions = {},
): string => {
  const {
    locale = "en-GB",
    decimals,
    maximumDecimals,
    prefix = "",
    suffix = "",
    currency,
  } = options;

  if (value === null || value === undefined) return "";

  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "";

  // Two places unless told otherwise, which is what every caller
  // before the ceiling existed was getting.
  const pinned = decimals ?? (maximumDecimals === undefined ? 2 : null);

  const formatter = new Intl.NumberFormat(locale, {
    ...(currency ? { style: "currency" as const, currency } : {}),
    minimumFractionDigits: pinned ?? 0,
    maximumFractionDigits: pinned ?? maximumDecimals,
  });

  return `${prefix}${formatter.format(num)}${suffix}`;
};
