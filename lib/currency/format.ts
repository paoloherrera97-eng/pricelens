/**
 * Display formatting.
 *
 * The only place a number becomes text, and the only place rounding happens
 * (ADR-006). Pure: the locale is always passed in, never detected.
 */

import { getCurrency, type CurrencyCode } from '@/config';

/**
 * Formats an amount in its currency, rounded to that currency's real minor
 * units — 0 for JPY, 3 for KWD, 2 for USD.
 *
 * Sub-unit values keep meaningful precision instead of collapsing: `$0.0031` is
 * useful, `$0.00` is a falsehood (PRD E7).
 *
 * **Every amount is shown in full, with the locale's thousands separators.**
 * Large values used to switch to compact notation, and it was wrong twice over:
 * `999.999` and `1.000.000` VND both rendered as `25,4 mil M₫` — two different
 * prices, one string — and Spanish `B` means 10¹² where English `B` means 10⁹,
 * so the same screen read a thousandfold differently to two travelers.
 *
 * Overflow, which is what compact notation existed to prevent (PRD E6), is
 * handled where it belongs: `text-fit` in globals.css sizes the value from its
 * own length and its container. Measured — the widest realistic result,
 * `25.399.974.600 ₫`, lays out at 239px inside a 278px card.
 */
export function formatCurrency(value: number, code: CurrencyCode, locale: string): string {
  if (!Number.isFinite(value)) return '';

  const { digits } = getCurrency(code);
  const magnitude = Math.abs(value);
  const smallestUnit = Math.pow(10, -digits);

  // Below the smallest unit but not zero: show enough digits to say something.
  if (magnitude > 0 && magnitude < smallestUnit) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      // Two significant digits past the leading zeros.
      maximumSignificantDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Formats a pair rate for the "1 THB = 0,026 EUR" line.
 *
 * Rates are not amounts: a rate of 0.0000262 rounded to 2 decimals is 0, which
 * would make the line meaningless. Significant digits are the right tool here.
 */
export function formatRate(rate: number, locale: string): string {
  if (!Number.isFinite(rate) || rate <= 0) return '';

  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: rate >= 1 ? 6 : 3,
    maximumFractionDigits: 20,
  }).format(rate);
}

export type RateAge =
  | { readonly unit: 'now' }
  | { readonly unit: 'minutes' | 'hours' | 'days'; readonly count: number };

/**
 * Buckets an age into the unit the UI should announce.
 *
 * Returns data rather than a string so the caller can render it through the
 * message catalogue with correct plurals — formatting text here would hardcode
 * a language into pure logic (ADR-009).
 */
export function describeAge(fetchedAt: string, now: Date): RateAge | null {
  const then = new Date(fetchedAt).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.max(0, Math.floor((now.getTime() - then) / 1000));

  if (seconds < 60) return { unit: 'now' };
  if (seconds < 3600) return { unit: 'minutes', count: Math.floor(seconds / 60) };
  if (seconds < 86_400) return { unit: 'hours', count: Math.floor(seconds / 3600) };
  return { unit: 'days', count: Math.floor(seconds / 86_400) };
}

/** Whether rates are old enough that the UI must say so (PRD FR-5). */
export function isStale(fetchedAt: string, now: Date, staleAfterSeconds: number): boolean {
  const then = new Date(fetchedAt).getTime();
  if (Number.isNaN(then)) return true;
  return (now.getTime() - then) / 1000 >= staleAfterSeconds;
}
