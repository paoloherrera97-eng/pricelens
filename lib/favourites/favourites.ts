/**
 * Favourite pairs — the data, with no React and no storage in sight.
 *
 * A favourite records the *country* being visited alongside the home currency,
 * not just two currency codes. Selecting one has to restore what the traveler
 * actually saw, and the app asks for a country rather than a currency
 * (ADR-014): restoring "EUR → ARS" would leave the picker unable to say
 * whether that was Spain or France.
 *
 * Identity, however, is the currency *pair*. Spain → ARS and France → ARS
 * convert identically, so offering both would be two ways to reach one result,
 * which is clutter rather than choice.
 */

import { getCountry, isCurrencyCode, type CurrencyCode } from '@/config';

export interface Favourite {
  /** ISO 3166-1 alpha-2 of the country being visited. */
  readonly country: string;
  /** The home currency being converted to. */
  readonly to: CurrencyCode;
}

/**
 * The cap.
 *
 * Favourites are a shortcut, and a shortcut you have to search through is not
 * one. Eight fits a phone's width in two swipes and keeps the stored value
 * small enough that it can never become the reason storage fails.
 */
export const MAX_FAVOURITES = 8;

/** The currency pair a favourite resolves to, or null if the country is gone. */
export function pairOf(favourite: Favourite): string | null {
  const from = getCountry(favourite.country)?.currency;
  return from ? `${from}→${favourite.to}` : null;
}

function isSamePair(a: Favourite, b: Favourite): boolean {
  const pair = pairOf(a);
  return pair !== null && pair === pairOf(b);
}

/** Whether this pair is already saved. Drives the star's filled state. */
export function isFavourite(favourites: readonly Favourite[], candidate: Favourite): boolean {
  return favourites.some((existing) => isSamePair(existing, candidate));
}

/**
 * Adds a favourite, or returns the list unchanged when its pair is already
 * saved. Newest first: the pair you just saved is the one you are most likely
 * to want back, and it means the cap drops the least recently saved.
 */
export function addFavourite(
  favourites: readonly Favourite[],
  candidate: Favourite,
): readonly Favourite[] {
  if (pairOf(candidate) === null) return favourites;
  if (isFavourite(favourites, candidate)) return favourites;

  return [candidate, ...favourites].slice(0, MAX_FAVOURITES);
}

/** Removes whichever entry resolves to the same pair. */
export function removeFavourite(
  favourites: readonly Favourite[],
  candidate: Favourite,
): readonly Favourite[] {
  return favourites.filter((existing) => !isSamePair(existing, candidate));
}

/** The star's whole behaviour: save it, or take it back. */
export function toggleFavourite(
  favourites: readonly Favourite[],
  candidate: Favourite,
): readonly Favourite[] {
  return isFavourite(favourites, candidate)
    ? removeFavourite(favourites, candidate)
    : addFavourite(favourites, candidate);
}

/**
 * Reads stored favourites, discarding anything that is not one.
 *
 * Stored data is untrusted input: it survives deploys, so it can have been
 * written by an older version, hand-edited, or corrupted. Entries naming a
 * country or currency this build no longer carries are dropped rather than
 * rendered — a favourite that cannot resolve to a pair is a chip that does
 * nothing when tapped.
 *
 * Returns null only when the value is not a list at all, which lets the caller
 * fall back to its own default rather than guess.
 */
export function parseFavourites(raw: string): readonly Favourite[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const seen = new Set<string>();
  const favourites: Favourite[] = [];

  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) continue;

    const { country, to } = entry as Record<string, unknown>;
    if (typeof country !== 'string' || typeof to !== 'string') continue;
    if (!isCurrencyCode(to)) continue;

    const favourite: Favourite = { country, to };
    const pair = pairOf(favourite);
    // Also collapses duplicates that a previous version may have written.
    if (pair === null || seen.has(pair)) continue;

    seen.add(pair);
    favourites.push(favourite);
  }

  return favourites.slice(0, MAX_FAVOURITES);
}

export function serialiseFavourites(favourites: readonly Favourite[]): string {
  return JSON.stringify(favourites);
}
