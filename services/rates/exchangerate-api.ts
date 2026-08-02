/**
 * Live rate provider — ExchangeRate-API's keyless endpoint (ADR-002).
 */

import { APP_CONFIG, RATE_PROVIDERS, type CurrencyCode } from '@/config';

import type { RateProvider, RateSnapshot, RateTable } from './types';

const CONFIG = RATE_PROVIDERS['exchangerate-api'];

/**
 * Validates and narrows a provider payload.
 *
 * Provider responses are untrusted input. Rejecting a malformed payload whole
 * is the point: letting `undefined` reach the arithmetic would produce `NaN`
 * where a price should be (PRD E9).
 */
export function parseResponse(payload: unknown, requestedBase: CurrencyCode): RateSnapshot {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Rate payload is not an object');
  }

  const body = payload as Record<string, unknown>;

  if (body.result !== 'success') {
    throw new Error(`Rate provider reported: ${String(body.result ?? 'no result field')}`);
  }

  const base = typeof body.base_code === 'string' ? body.base_code : null;
  if (base === null) throw new Error('Rate payload has no base_code');
  if (base !== requestedBase) {
    // Silently accepting a different base would make every conversion wrong.
    throw new Error(`Rate payload base ${base} does not match requested ${requestedBase}`);
  }

  const rawRates = body.rates;
  if (typeof rawRates !== 'object' || rawRates === null) {
    throw new Error('Rate payload has no rates');
  }

  const rates: Record<string, number> = {};
  for (const [code, value] of Object.entries(rawRates as Record<string, unknown>)) {
    // Skip individual bad entries rather than failing the whole table; a
    // currency we drop simply disappears from the selectors (PRD E12).
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      rates[code] = value;
    }
  }

  if (Object.keys(rates).length === 0) throw new Error('Rate payload contained no usable rates');
  if (rates[base] === undefined) throw new Error('Rate payload omits its own base currency');

  return {
    base: base as CurrencyCode,
    rates: rates as RateTable,
    fetchedAt: timestampOf(body),
    source: CONFIG.id,
    degraded: false,
  };
}

/** Prefers the provider's own update time over our clock, when it gives one. */
function timestampOf(body: Record<string, unknown>): string {
  const unix = body.time_last_update_unix;
  if (typeof unix === 'number' && Number.isFinite(unix) && unix > 0) {
    return new Date(unix * 1000).toISOString();
  }
  return new Date().toISOString();
}

export const exchangeRateApiProvider: RateProvider = {
  id: CONFIG.id,

  async fetchRates(base: CurrencyCode): Promise<RateSnapshot> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), APP_CONFIG.ratesRequestTimeoutMs);

    try {
      const response = await fetch(`${CONFIG.endpoint}/${base}`, {
        signal: controller.signal,
        // One upstream call per hour per deployment, regardless of user count.
        next: { revalidate: APP_CONFIG.ratesRevalidateSeconds },
      });

      if (!response.ok) {
        throw new Error(`Rate provider responded ${response.status}`);
      }

      return parseResponse(await response.json(), base);
    } finally {
      clearTimeout(timeout);
    }
  },
};
