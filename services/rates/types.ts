/**
 * The exchange-rate provider contract.
 *
 * Everything above this layer — hooks, components, conversion math — depends on
 * `RateSnapshot` and never on a specific provider. That is what allows the live
 * provider, the offline fallback, and any future replacement to be swapped
 * without touching business logic (ADR-002).
 */

import type { CurrencyCode, ProviderId } from '@/config';
import type { RateSnapshot, RateTable, RateVariant } from '@/types';

/**
 * Defined in `types/` so pure `lib/` code can use them without importing across
 * a boundary (docs/ARCHITECTURE.md §5). Re-exported here because this module is
 * the provider contract, and a provider author should not have to know which
 * side of that boundary each type happens to live on.
 */
export type { RateSnapshot, RateTable, RateVariant };

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
