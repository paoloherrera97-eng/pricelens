/**
 * Provider resolution.
 *
 * Tries each provider in `PROVIDER_CHAIN` and returns the first success.
 * Nothing above this module knows which provider produced a table (ADR-002).
 */

import { FEATURES, PROVIDER_CHAIN, type CurrencyCode, type ProviderId } from '@/config';

import { createArsParallelProvider } from './ars-parallel';
import { exchangeRateApiProvider } from './exchangerate-api';
import type { RateOverlayProvider, RateProvider, RateSnapshot, RateVariant } from './types';

const REGISTRY: Partial<Record<ProviderId, RateProvider>> = {
  'exchangerate-api': exchangeRateApiProvider,
};

/**
 * Overlays applied after the base table resolves.
 *
 * A function rather than a constant because an overlay needs the official rate
 * it is being compared against, which only exists once the base table is in
 * hand.
 */
function defaultOverlays(snapshot: RateSnapshot): readonly RateOverlayProvider[] {
  if (!FEATURES.rateVariants) return [];
  return [createArsParallelProvider(() => snapshot.rates.ARS ?? 0)];
}

/**
 * Attaches whatever the overlays returned, leaving `rates` untouched.
 *
 * Three properties this has to hold, in order of importance:
 *
 * 1. **An overlay can never break the app.** Each one is awaited independently
 *    and a rejection is dropped: the base table is what everybody who is not in
 *    Argentina depends on, and it must not be hostage to a community-run API.
 * 2. **The server does not choose.** `rates` keeps exactly what the base
 *    provider said — the official rate — and the variants ride alongside. The
 *    client substitutes the one the user selected.
 * 3. **A single quotation is not a variant.** An overlay that returns one rate
 *    adds nothing to choose between, so it is discarded rather than rendering a
 *    selector with one option.
 */
async function withOverlays(
  snapshot: RateSnapshot,
  base: CurrencyCode,
  overlays: readonly RateOverlayProvider[],
): Promise<RateSnapshot> {
  if (overlays.length === 0) return snapshot;

  const settled = await Promise.allSettled(
    overlays.map(async (overlay) => ({
      currency: overlay.currency,
      variants: await overlay.fetchVariants(base),
    })),
  );

  const variants: Record<string, readonly RateVariant[]> = {};

  for (const [index, outcome] of settled.entries()) {
    if (outcome.status === 'rejected') {
      // Worth logging — a persistently failing overlay is a real regression —
      // but never worth failing the request over.
      console.warn(`[rates] overlay ${overlays[index]?.id} unavailable:`, outcome.reason);
      continue;
    }
    if (outcome.value.variants.length > 1) {
      variants[outcome.value.currency] = outcome.value.variants;
    }
  }

  if (Object.keys(variants).length === 0) return snapshot;
  return { ...snapshot, variants };
}

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
  overlays: (snapshot: RateSnapshot) => readonly RateOverlayProvider[] = defaultOverlays,
): Promise<RateSnapshot> {
  const attempts: Array<{ provider: ProviderId; reason: string }> = [];

  for (const id of chain) {
    const provider = registry[id];
    if (!provider) {
      attempts.push({ provider: id, reason: 'not registered' });
      continue;
    }

    try {
      const snapshot = await provider.fetchRates(base);
      return await withOverlays(snapshot, base, overlays(snapshot));
    } catch (error) {
      attempts.push({
        provider: id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new RatesUnavailableError(attempts);
}

export type {
  RateOverlayProvider,
  RateProvider,
  RateSnapshot,
  RateTable,
  RateVariant,
} from './types';
