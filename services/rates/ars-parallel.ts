/**
 * Argentina's parallel quotations — the overlay that made this layer necessary.
 *
 * The peso trades at materially different rates depending on how you pay. A
 * traveler paying cash gets the "blue" rate; paying by card gets a tourist rate
 * derived from the financial market; the official rate is what almost no
 * visitor transacts at. Publishing one of these as "the" exchange rate would be
 * the confidently wrong price this product exists not to give (ADR-018).
 *
 * Source: dolarapi.com — public, keyless, community-run. That last word is the
 * important one: unlike the base provider, this is not a central bank, so every
 * value it returns is treated as untrusted input and the whole overlay is
 * dropped rather than half-trusted when anything looks wrong.
 */

import { APP_CONFIG, type CurrencyCode } from '@/config';

import type { RateOverlayProvider, RateVariant } from './types';

const ENDPOINT = 'https://dolarapi.com/v1/dolares';

/** Their `casa` identifier → our variant id. Anything else is ignored. */
const VARIANT_BY_HOUSE: Readonly<Record<string, string>> = {
  oficial: 'official',
  blue: 'blue',
  tarjeta: 'card',
};

/**
 * A quotation must be within this factor of the official rate to be believed.
 *
 * A parallel rate legitimately runs far from the official one, but not by
 * orders of magnitude. This catches the failure that would otherwise be
 * invisible: a source changing units, returning a placeholder, or quoting
 * something that is not a peso rate at all. Rejecting the overlay leaves the
 * official rate in place, which is wrong-but-sane rather than absurd.
 */
const MAX_DIVERGENCE = 10;

interface Quote {
  readonly id: string;
  readonly rate: number;
  readonly fetchedAt: string;
}

/**
 * Validates the payload and returns the quotations we recognise.
 *
 * Uses the midpoint of buy and sell. A single side would imply a specific
 * counterparty — "compra" is what a house pays for your dollars, "venta" what
 * it charges — and this number is a reference for judging a price, not a quote
 * for a transaction. The midpoint is the neutral, and it is what every
 * published reference for these rates uses.
 */
export function parseQuotes(payload: unknown): readonly Quote[] {
  if (!Array.isArray(payload)) throw new Error('Parallel payload is not an array');

  const quotes: Quote[] = [];

  for (const entry of payload) {
    if (typeof entry !== 'object' || entry === null) continue;

    const { casa, compra, venta, fechaActualizacion } = entry as Record<string, unknown>;
    if (typeof casa !== 'string') continue;

    const id = VARIANT_BY_HOUSE[casa.toLowerCase()];
    if (!id) continue;

    // Either side may legitimately be absent; both absent is not a quotation.
    const sides = [compra, venta].filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0,
    );
    if (sides.length === 0) continue;

    const rate = sides.reduce((total, value) => total + value, 0) / sides.length;

    quotes.push({
      id,
      rate,
      fetchedAt:
        typeof fechaActualizacion === 'string' && !Number.isNaN(Date.parse(fechaActualizacion))
          ? new Date(fechaActualizacion).toISOString()
          : new Date().toISOString(),
    });
  }

  if (quotes.length === 0) throw new Error('Parallel payload contained no usable quotations');
  return quotes;
}

/**
 * Drops the whole overlay if any quotation is implausible against the official
 * table, rather than shipping one bad number among good ones.
 */
export function assertPlausible(quotes: readonly Quote[], officialRate: number): void {
  for (const quote of quotes) {
    const ratio = quote.rate / officialRate;
    if (!Number.isFinite(ratio) || ratio < 1 / MAX_DIVERGENCE || ratio > MAX_DIVERGENCE) {
      throw new Error(`Quotation ${quote.id} is ${ratio.toFixed(1)}× the official rate`);
    }
  }
}

export function createArsParallelProvider(officialRateOf: () => number): RateOverlayProvider {
  return {
    id: 'ars-parallel',
    currency: 'ARS' as CurrencyCode,

    async fetchVariants(base: CurrencyCode): Promise<readonly RateVariant[]> {
      // Every quotation from this source is pesos per US dollar. Substituting
      // them into a table anchored elsewhere would be silently wrong, so it is
      // refused rather than converted on a guess.
      if (base !== 'USD') {
        throw new Error(`Parallel quotations are USD-denominated, base is ${base}`);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), APP_CONFIG.ratesRequestTimeoutMs);

      try {
        const response = await fetch(ENDPOINT, {
          signal: controller.signal,
          // Far shorter than the base table's hour: parallel rates move
          // intraday, and an hour-old blue rate is its own kind of wrong.
          next: { revalidate: APP_CONFIG.parallelRevalidateSeconds },
        });

        if (!response.ok) throw new Error(`Parallel source responded ${response.status}`);

        const quotes = parseQuotes(await response.json());
        assertPlausible(quotes, officialRateOf());

        return quotes.map((quote) => ({
          id: quote.id,
          rate: quote.rate,
          source: 'dolarapi.com',
          fetchedAt: quote.fetchedAt,
        }));
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
