/**
 * Conversion math.
 *
 * Pure and synchronous by design (ADR-001): every pair is derived locally from a
 * single base-anchored table, so a conversion costs one division and never a
 * network round-trip.
 */

import type { RateTable } from '@/types';

/**
 * The rate for `from → to`, derived by triangulation through the table's base:
 *
 *     rate(from → to) = table[to] / table[from]
 *
 * Works for any pair, including ones not involving the base currency, because
 * `base → base` is 1.
 *
 * Returns `null` when either currency is missing from the table — a missing rate
 * must surface as "unavailable", never as a silently wrong number (PRD E12).
 */
export function getRate(table: RateTable, from: string, to: string): number | null {
  if (from === to) return 1;

  const fromRate = table[from];
  const toRate = table[to];

  if (typeof fromRate !== 'number' || typeof toRate !== 'number') return null;
  if (!Number.isFinite(fromRate) || !Number.isFinite(toRate)) return null;
  // A zero or negative rate is corrupt data, not a conversion.
  if (fromRate <= 0 || toRate <= 0) return null;

  return toRate / fromRate;
}

/**
 * Converts `amount` from one currency to another.
 *
 * Deliberately does **not** round: rounding happens once, at display time, using
 * the target currency's real minor units (ADR-006). Rounding here would compound
 * error into any downstream use of the value.
 */
export function convert(amount: number, table: RateTable, from: string, to: string): number | null {
  if (!Number.isFinite(amount)) return null;

  const rate = getRate(table, from, to);
  if (rate === null) return null;

  return amount * rate;
}
