/**
 * The exchange-rate provider contract.
 *
 * Everything above this layer — hooks, components, conversion math — depends on
 * `RateSnapshot` and never on a specific provider. That is what allows the live
 * provider, the offline fallback, and any future replacement to be swapped
 * without touching business logic (ADR-002).
 */

import type { CurrencyCode, ProviderId } from '@/config';
import type { RateTable, RateVariant } from '@/types';

/**
 * Rates expressed against a single base currency (ADR-001). Defined in `types/`
 * so pure `lib/` code can use it without importing across a boundary.
 */
export type { RateTable, RateVariant };

export interface RateSnapshot {
  /** The currency all rates in `rates` are quoted against. */
  readonly base: CurrencyCode;
  readonly rates: RateTable;
  /** When this data was retrieved, ISO 8601. */
  readonly fetchedAt: string;
  /** Which provider produced it — surfaced to the user for transparency. */
  readonly source: ProviderId;
  /**
   * True when this is fallback data rather than a live fetch. The UI must
   * distinguish the two: presenting degraded data as live is the one thing this
   * product must never do (PROJECT_BIBLE, Value #4).
   */
  readonly degraded: boolean;
  /**
   * Alternative quotations, keyed by currency code. Absent for every currency
   * with a single rate, which is nearly all of them.
   *
   * `rates` above is left exactly as the base provider returned it — the server
   * does not choose on the user's behalf. The client substitutes the selected
   * variant into its own copy of the table before converting.
   */
  readonly variants?: Readonly<Record<string, readonly RateVariant[]>>;
}

/**
 * Supplies alternative quotations for a single currency.
 *
 * Deliberately separate from `RateProvider`: a provider answers "what is the
 * whole table", an overlay answers "what else could this one currency be".
 * Overlays are additive and optional — one failing must leave the base table
 * exactly as it was.
 */
export interface RateOverlayProvider {
  readonly id: string;
  /** The currency this overlay quotes. */
  readonly currency: CurrencyCode;
  /**
   * Variants quoted per one unit of `base`.
   * Rejects on failure; the caller drops the overlay and keeps the base table.
   */
  fetchVariants(base: CurrencyCode): Promise<readonly RateVariant[]>;
}

export interface RateProvider {
  readonly id: ProviderId;
  /**
   * Resolve a rate table for `base`.
   * Rejects on network failure, timeout, or a payload that fails validation —
   * callers rely on rejection to advance along the provider chain.
   */
  fetchRates(base: CurrencyCode): Promise<RateSnapshot>;
}
