/**
 * Working out which currency the traveler is likely to think in.
 *
 * **Nothing here asks for permission, and that is a design decision rather than
 * an omission.** The Geolocation API would be more precise, but it prompts —
 * and a permission dialog on first paint is the opposite of understanding a
 * price in three seconds. It would also answer the wrong question: geolocation
 * says where the phone is *right now*, which for a traveler is the country
 * whose prices they are trying to escape, not the currency they think in. The
 * device's own region and timezone settings are free, silent, and closer to the
 * truth.
 *
 * Two signals, in order of trustworthiness:
 *
 * 1. **The locale's region subtag** (`es-AR` → `AR`). This comes from the OS
 *    region setting, which is where the user says they are from. It survives
 *    travel, which is exactly what a *home* currency should do.
 * 2. **The timezone** (`America/Argentina/Buenos_Aires` → `AR`). Used only when
 *    the locale carries no region — `es`, `en` and so on. It follows the phone
 *    across borders, so it is the weaker signal for this purpose, but a weak
 *    signal beats defaulting to euros for someone in Buenos Aires.
 *
 * Deliberately absent: `Intl.Locale.maximize()`, which would turn a bare `en`
 * into `en-Latn-US`. That is CLDR's most-likely-subtags guess, not information
 * about this user, and silently selecting US dollars for every English speaker
 * on the strength of it would be worse than the honest default.
 */

import { getCountry, isCurrencyCode, type CurrencyCode } from '@/config';

export interface DetectionSignals {
  /** Usually `navigator.language`. */
  readonly locale?: string | null;
  /** Usually `Intl.DateTimeFormat().resolvedOptions().timeZone`. */
  readonly timeZone?: string | null;
}

/** The region subtag of a BCP 47 tag, or null when it carries none. */
export function regionFromLocale(locale: string | null | undefined): string | null {
  if (!locale) return null;

  try {
    // `Intl.Locale` handles the cases a split on '-' gets wrong: script
    // subtags (`zh-Hant-TW`), extensions, and casing (`es-ar`).
    const region = new Intl.Locale(locale).region;
    return region && /^[A-Z]{2}$/.test(region) ? region : null;
  } catch {
    // Malformed tag. Nothing to salvage.
    return null;
  }
}

/**
 * The currency of a country, when we have one for it.
 *
 * Returns null rather than guessing for regions absent from the curated table —
 * a wrong home currency is worse than the default, because it is wrong in a way
 * the user has no reason to check.
 */
export function currencyForRegion(region: string | null): CurrencyCode | null {
  if (!region) return null;

  const currency = getCountry(region)?.currency;
  return currency && isCurrencyCode(currency) ? currency : null;
}

/**
 * Canonicalises a timezone through the engine's own tables.
 *
 * Browsers have historically reported legacy names — `Asia/Calcutta` for
 * `Asia/Kolkata`, `Europe/Kiev` for `Europe/Kyiv`.
 *
 * Engines do not agree on which spelling is canonical, and some resolve
 * *backwards*: Node's ICU turns `Asia/Kolkata` into `Asia/Calcutta`. So this is
 * a fallback, tried only after the reported name misses — canonicalising first
 * would turn a hit into a miss on exactly those engines. The generated table
 * carries both spellings wherever ICU knew about them.
 */
function canonicalTimeZone(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone ?? timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * Best guess at the traveler's home currency, or null to keep the default.
 *
 * Async because the timezone table is a generated ~12KB map that the common
 * case never needs: a locale with a region subtag resolves without it, so the
 * chunk is only fetched for the minority of devices that report a bare
 * language. Detection runs once, after first paint, and never blocks anything.
 */
export async function detectHomeCurrency(signals: DetectionSignals): Promise<CurrencyCode | null> {
  const fromLocale = currencyForRegion(regionFromLocale(signals.locale));
  if (fromLocale) return fromLocale;

  if (!signals.timeZone) return null;

  const { TIMEZONE_COUNTRY } = await import('@/config/timezones');
  const country =
    TIMEZONE_COUNTRY[signals.timeZone] ??
    TIMEZONE_COUNTRY[canonicalTimeZone(signals.timeZone)] ??
    null;

  return currencyForRegion(country);
}

/** The signals this browser can offer, or empty ones under server rendering. */
export function readSignals(): DetectionSignals {
  if (typeof navigator === 'undefined') return {};

  let timeZone: string | null = null;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    // Some locked-down environments throw here. The locale alone is fine.
  }

  return { locale: navigator.language ?? null, timeZone };
}
