/**
 * The exchange-rate provider contract.
 *
 * Everything above this layer — hooks, components, conversion math — depends on
 * `RateSnapshot` and never on a specific provider. That is what allows the live
 * provider, the offline fallback, and any future replacement to be swapped
 * without touching business logic (ADR-002).
 */

import type { CurrencyCode, ProviderId } from '@/config';
import type { RateTable } from '@/types';

/**
 * Rates expressed against a single base currency (ADR-001). Defined in `types/`
 * so pure `lib/` code can use it without importing across a boundary.
 */
export type { RateTable };

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
