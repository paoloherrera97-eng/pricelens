/**
 * Choosing between several quotations of the same currency.
 *
 * The whole point of this module is what it *doesn't* do: it never converts
 * anything. It substitutes one number in the rate table and hands the table
 * back, so `getRate` and `convert` stay exactly as they were — pure, unaware
 * that variants exist, and still doing one division (ADR-001).
 *
 * Everything here is a pure function over data the server already sent.
 */

import type { RateTable, RateVariant } from '@/types';

/**
 * The default when the traveler has never chosen.
 *
 * Blue rather than official, and the reasoning is worth stating because the
 * opposite is arguable. "Safest" can mean minimising the *direction* of the
 * error — the official rate never makes something look cheaper than it is, so
 * nobody overspends. It can also mean minimising the *size* of the error, and
 * there the official rate is the worst of the three: it is the one rate almost
 * no traveler actually transacts at, and the gap has historically been large.
 *
 * The second reading wins because the selector is visible. The user can see
 * which rate produced the number and change it in one tap, so the protection
 * the first reading offers is provided by the interface rather than by hiding
 * behind a conservative number.
 */
export const DEFAULT_VARIANT_ID = 'blue';

/**
 * Presentation order, independent of whatever order the source returns.
 *
 * Cash first because it is the default and the most common; official last
 * because it is the one almost no visitor transacts at. Anything unrecognised
 * keeps its relative position at the end rather than being dropped.
 */
const DISPLAY_ORDER = ['blue', 'card', 'official'];

/** The user's variant choice per currency, e.g. `{ ARS: 'card' }`. */
export type VariantSelection = Readonly<Record<string, string>>;

/** Variants for a currency, or an empty list when it has a single rate. */
export function variantsFor(
  variants: Readonly<Record<string, readonly RateVariant[]>> | undefined,
  currency: string,
): readonly RateVariant[] {
  const list = variants?.[currency];
  if (!list || list.length <= 1) return [];

  const rank = (id: string) => {
    const index = DISPLAY_ORDER.indexOf(id);
    return index === -1 ? DISPLAY_ORDER.length : index;
  };
  return [...list].sort((a, b) => rank(a.id) - rank(b.id));
}

/**
 * Which variant to show: the user's choice, else the default, else the first
 * one offered.
 *
 * Falls through rather than failing when a stored choice names a variant the
 * provider no longer returns — a preference from an older deploy must not leave
 * the screen without a rate.
 */
export function resolveVariant(
  available: readonly RateVariant[],
  selection: VariantSelection,
  currency: string,
): RateVariant | null {
  if (available.length === 0) return null;

  const chosenId = selection[currency];
  return (
    available.find((variant) => variant.id === chosenId) ??
    available.find((variant) => variant.id === DEFAULT_VARIANT_ID) ??
    available[0] ??
    null
  );
}

/**
 * The rate table with one currency's rate replaced by the chosen variant.
 *
 * Returns the *same object* when there is nothing to substitute, so the common
 * case — every country that is not Argentina — allocates nothing and any
 * downstream memoisation keyed on the table stays stable.
 */
export function applyVariant(
  table: RateTable,
  currency: string,
  variant: RateVariant | null,
): RateTable {
  if (!variant) return table;
  if (!Number.isFinite(variant.rate) || variant.rate <= 0) return table;
  if (table[currency] === variant.rate) return table;

  return { ...table, [currency]: variant.rate };
}

/** Reads a stored selection, discarding anything that is not one. */
export function parseSelection(raw: string): VariantSelection | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;

  const selection: Record<string, string> = {};
  for (const [currency, id] of Object.entries(parsed as Record<string, unknown>)) {
    // Codes are three letters; ids are short slugs. Anything else is not ours.
    if (/^[A-Z]{3}$/.test(currency) && typeof id === 'string' && /^[a-z-]{1,16}$/.test(id)) {
      selection[currency] = id;
    }
  }
  return selection;
}

export function serialiseSelection(selection: VariantSelection): string {
  return JSON.stringify(selection);
}
