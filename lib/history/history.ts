/**
 * Conversion history — the data, with no React and no storage in sight.
 *
 * An entry records what the traveler *saw*, not just what they asked for: the
 * amount, the rate in force at the time, and the result. A history that stored
 * only the inputs would re-convert them at today's rate, so yesterday's dinner
 * would quietly change price every time it was opened — which is the opposite
 * of a record.
 *
 * Reusing an entry therefore restores the *inputs* and lets the app convert
 * afresh; the stored result is what the list shows. Both are true, and saying
 * which is which is the point (PROJECT_BIBLE, Value #4).
 */

import { getCountry, isCurrencyCode, type CurrencyCode } from '@/config';

/**
 * The cap.
 *
 * Twenty is roughly a trip's worth of prices and small enough that the stored
 * value can never become the reason storage fails. Beyond that the list stops
 * being a memory and becomes something to search, which is a different feature.
 */
export const MAX_HISTORY = 20;

export interface HistoryEntry {
  /** When the conversion was made, ISO 8601. Also the entry's identity. */
  readonly at: string;
  /** ISO 3166-1 alpha-2 of the country being visited. */
  readonly country: string;
  /** The currency the price was in. */
  readonly from: CurrencyCode;
  /** The currency it was converted to. */
  readonly to: CurrencyCode;
  /** The amount as the field held it, so reuse restores exactly what was typed. */
  readonly amount: string;
  /** The pair rate actually used, `to` per one unit of `from`. */
  readonly rate: number;
  /** The converted value, unrounded — display rounding stays at display time. */
  readonly result: number;
  /** Which quotation was in force, when the currency had more than one. */
  readonly variantId?: string;
}

/** What a new entry is made of. The timestamp is the caller's to supply. */
export type NewHistoryEntry = Omit<HistoryEntry, 'at'>;

/**
 * Whether two entries record the same conversion.
 *
 * Deliberately excludes the timestamp and the rate: the same price looked up
 * twice a minute apart is one memory, and the rate may have been refreshed in
 * between without the traveler having done anything different.
 */
function isSameConversion(a: NewHistoryEntry, b: NewHistoryEntry): boolean {
  return (
    a.country === b.country &&
    a.from === b.from &&
    a.to === b.to &&
    a.amount === b.amount &&
    a.variantId === b.variantId
  );
}

/**
 * Records a conversion, most recent first.
 *
 * A repeat of whatever is already at the top is dropped rather than stacked:
 * the amount field converts on every keystroke, so "1", "12", "120" would
 * otherwise fill the list with the act of typing one number. Only the
 * *consecutive* duplicate is collapsed — coming back to the same price after
 * looking at another one is a real second visit and worth keeping.
 */
export function addHistoryEntry(
  history: readonly HistoryEntry[],
  entry: NewHistoryEntry,
  at: string,
): readonly HistoryEntry[] {
  const newest = history[0];
  if (newest && isSameConversion(newest, entry)) {
    // Same conversion, newer moment and possibly a newer rate: refresh the top
    // entry in place rather than adding a second one.
    return [{ ...entry, at }, ...history.slice(1)];
  }

  return [{ ...entry, at }, ...history].slice(0, MAX_HISTORY);
}

/** Drops one entry, identified by its timestamp. */
export function removeHistoryEntry(
  history: readonly HistoryEntry[],
  at: string,
): readonly HistoryEntry[] {
  return history.filter((entry) => entry.at !== at);
}

/**
 * Reads stored history.
 *
 * Stored data is untrusted input: it survives deploys, so it can have been
 * written by an older version, hand-edited, or truncated. Entries naming a
 * country or currency this build no longer carries are dropped rather than
 * rendered — an entry that cannot resolve is a row that does nothing when
 * tapped.
 *
 * Returns null only when the value is not a list at all, which lets the caller
 * fall back to its own default rather than guess.
 */
export function parseHistory(raw: string): readonly HistoryEntry[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const seen = new Set<string>();
  const history: HistoryEntry[] = [];

  for (const value of parsed) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as Record<string, unknown>;

    const { at, country, from, to, amount, rate, result, variantId } = entry;

    if (typeof at !== 'string' || Number.isNaN(new Date(at).getTime())) continue;
    if (typeof country !== 'string' || !getCountry(country)) continue;
    if (typeof from !== 'string' || !isCurrencyCode(from)) continue;
    if (typeof to !== 'string' || !isCurrencyCode(to)) continue;
    if (typeof amount !== 'string') continue;
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) continue;
    if (typeof result !== 'number' || !Number.isFinite(result)) continue;
    if (variantId !== undefined && typeof variantId !== 'string') continue;

    // The timestamp is the identity, so a duplicate one would give two rows the
    // same React key and make deletion ambiguous.
    if (seen.has(at)) continue;
    seen.add(at);

    history.push({
      at,
      country,
      from,
      to,
      amount,
      rate,
      result,
      ...(variantId === undefined ? {} : { variantId }),
    });
  }

  // Newest first regardless of the order it was written in, and capped in case
  // an older build allowed more.
  history.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return history.slice(0, MAX_HISTORY);
}

export function serialiseHistory(history: readonly HistoryEntry[]): string {
  return JSON.stringify(history);
}
