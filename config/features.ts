/**
 * Feature flags.
 *
 * The `false` entries are the point of this file: they name the seams where
 * future capabilities plug in, without shipping a line of their implementation.
 * Flipping one on is a deliberate act with a roadmap entry behind it — see
 * docs/ROADMAP.md.
 */

export const FEATURES = {
  // --- V1 -------------------------------------------------------------
  /** Installable + offline-capable. On from day one. */
  pwa: true,
  /** Fall back to bundled snapshot rates when the provider is unreachable. */
  offlineFallbackRates: true,
  /** Remember the home currency in localStorage (ADR-005). */
  persistHomeCurrency: true,

  // --- Deliberately off. Each has a roadmap entry. --------------------
  /** V2 — recent/favourite currencies. */
  recentCurrencies: false,
  /** V2 — dark mode. Tokens are already CSS variables, so this is a palette. */
  darkMode: false,
  /** V3 — camera capture and OCR of price tags. */
  ocr: false,
  /** V4 — local price context and AI assistance. */
  ai: false,
  /** V5 — accounts, sync, and history. */
  history: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
