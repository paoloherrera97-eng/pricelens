/**
 * Shared domain types.
 *
 * These live here rather than in `services/` so that pure `lib/` code can use
 * them without importing across a boundary (docs/ARCHITECTURE.md §5).
 */

import type { CurrencyCode, ProviderId } from '@/config';

/**
 * Rates quoted against a single base currency (ADR-001).
 *
 * Keyed by plain `string` rather than `CurrencyCode`: this data comes from a
 * third party and may contain codes we do not know about. Lookups are checked.
 */
export type RateTable = Readonly<Record<string, number>>;

/**
 * One quotation for a currency that has more than one.
 *
 * Lives here rather than in `services/` for the same reason `RateTable` does:
 * pure `lib/` code and components both need it, and neither may import across
 * the services boundary (docs/ARCHITECTURE.md §5).
 *
 * Most currencies have exactly one rate and never produce a variant. A few —
 * Argentina is the reason this exists — trade at materially different rates
 * depending on how you pay, and picking one silently would be the "confidently
 * wrong price" this product exists not to give (ADR-018).
 *
 * `rate` is quoted in the snapshot's base, exactly like an entry in
 * `RateTable`, so applying a variant is a single-key substitution and the
 * conversion engine never learns that variants exist.
 */
export interface RateVariant {
  /** Stable identifier, also the message key for its label. */
  readonly id: string;
  /** Units of this currency per one unit of the snapshot's base. */
  readonly rate: number;
  /** Human-readable attribution, shown with the rate. */
  readonly source: string;
  readonly fetchedAt: string;
}

/**
 * One retrieval of the rate table (ADR-001).
 *
 * Here rather than in `services/` for the same reason `RateTable` and
 * `RateVariant` are: the last snapshot is cached and read back by pure `lib/`
 * code, which may not import across the services boundary
 * (docs/ARCHITECTURE.md §5). `services/rates/types` re-exports it, so the
 * provider contract still reads as one piece.
 */
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

/** The result of a conversion, carrying enough context to render it honestly. */
export interface ConversionResult {
  readonly amount: number;
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  /** Converted value, unrounded — rounding happens at display time (ADR-006). */
  readonly converted: number;
  /** The effective pair rate used, shown to the user so the working is visible. */
  readonly rate: number;
}
