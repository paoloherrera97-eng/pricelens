/**
 * Provider resolution.
 *
 * Tries each provider in `PROVIDER_CHAIN` and returns the first success.
 * Nothing above this module knows which provider produced a table (ADR-002).
 */

import { PROVIDER_CHAIN, type CurrencyCode, type ProviderId } from '@/config';

import { exchangeRateApiProvider } from './exchangerate-api';
import type { RateProvider, RateSnapshot } from './types';

const REGISTRY: Partial<Record<ProviderId, RateProvider>> = {
  'exchangerate-api': exchangeRateApiProvider,
};

export class RatesUnavailableError extends Error {
  readonly attempts: ReadonlyArray<{ provider: ProviderId; reason: string }>;

  constructor(attempts: ReadonlyArray<{ provider: ProviderId; reason: string }>) {
    super(`No rate provider succeeded (${attempts.length} attempted)`);
    this.name = 'RatesUnavailableError';
    this.attempts = attempts;
  }
}

/**
 * Resolves a rate table.
 *
 * Throws `RatesUnavailableError` when every provider fails. That is deliberate:
 * there is no bundled snapshot to fall back to, because rates we invented would
 * look exactly like rates we fetched. The app degrades to the last table the
 * user actually received (held by the service worker) and otherwise says plainly
 * that rates are unavailable — see ADR-013.
 */
export async function resolveRates(
  base: CurrencyCode,
  chain: readonly ProviderId[] = PROVIDER_CHAIN,
  // Injectable so the chain's ordering and failure handling can be tested
  // without touching the network (docs/ARCHITECTURE.md §10).
  registry: Partial<Record<ProviderId, RateProvider>> = REGISTRY,
): Promise<RateSnapshot> {
  const attempts: Array<{ provider: ProviderId; reason: string }> = [];

  for (const id of chain) {
    const provider = registry[id];
    if (!provider) {
      attempts.push({ provider: id, reason: 'not registered' });
      continue;
    }

    try {
      return await provider.fetchRates(base);
    } catch (error) {
      attempts.push({
        provider: id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new RatesUnavailableError(attempts);
}

export type { RateProvider, RateSnapshot, RateTable } from './types';
