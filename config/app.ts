/**
 * Application settings.
 *
 * Every tunable value lives here rather than being scattered as literals across
 * the codebase, so that changing behaviour is a config edit and not a search.
 */

import type { CurrencyCode } from './currencies';

export const APP_CONFIG = {
  /** Product name, used in metadata and the PWA manifest. */
  name: 'PriceLens',

  /**
   * The rate table anchor (ADR-001). Every pair is derived from this base by
   * triangulation, so it is an implementation detail the user never sees.
   * USD is chosen because every provider quotes it.
   */
  baseCurrency: 'USD' satisfies CurrencyCode as CurrencyCode,

  /** Shown until the traveler picks their own. */
  defaultHomeCurrency: 'EUR' satisfies CurrencyCode as CurrencyCode,

  /** The currency being converted *from* on a cold start. */
  defaultForeignCurrency: 'USD' satisfies CurrencyCode as CurrencyCode,

  /**
   * How long the server-side Data Cache holds a rate table, in seconds.
   * One hour: rates move fractions of a percent per day, far below the
   * threshold that changes a purchase decision (see PRODUCT_REQUIREMENTS §9).
   */
  ratesRevalidateSeconds: 3600,

  /**
   * How long the Data Cache holds a parallel quotation, in seconds.
   * Far shorter than the base table's hour: these move intraday, and an
   * hour-old blue rate is its own kind of wrong (ADR-018).
   */
  parallelRevalidateSeconds: 300,

  /** Beyond this age, the UI marks rates as stale (PRD FR-5). */
  ratesStaleAfterSeconds: 60 * 60 * 24,

  /** Client request timeout for the rates endpoint, in milliseconds. */
  ratesRequestTimeoutMs: 8000,

  /**
   * localStorage keys. Namespaced so they cannot collide with anything else
   * on the origin.
   *
   * Both entries hold *preferences the user chose*, and nothing else: no
   * amounts, no timestamps, no record of activity. That boundary is the whole
   * of ADR-005 and ADR-016, and adding a key requires an ADR of its own.
   */
  storageKeys: {
    homeCurrency: 'pricelens.home-currency',
    favourites: 'pricelens.favourites',
    rateVariants: 'pricelens.rate-variants',
    /** The last table actually received, so an outage costs freshness, not the app. */
    lastRates: 'pricelens.last-rates',
  },
} as const;
