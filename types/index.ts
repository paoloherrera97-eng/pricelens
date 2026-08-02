/**
 * Shared domain types.
 *
 * These live here rather than in `services/` so that pure `lib/` code can use
 * them without importing across a boundary (docs/ARCHITECTURE.md §5).
 */

import type { CurrencyCode } from '@/config';

/**
 * Rates quoted against a single base currency (ADR-001).
 *
 * Keyed by plain `string` rather than `CurrencyCode`: this data comes from a
 * third party and may contain codes we do not know about. Lookups are checked.
 */
export type RateTable = Readonly<Record<string, number>>;

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
