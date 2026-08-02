/**
 * Internationalisation configuration.
 *
 * The MVP ships Spanish only, but nothing in the codebase assumes a single
 * locale: strings live in `messages/<locale>.json` and are reached through
 * next-intl. Adding a locale is a JSON file plus an entry in `LOCALES` — no
 * call-site changes (ADR-009).
 */

export const LOCALES = ['es'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/**
 * BCP 47 tags passed to `Intl` for number and currency formatting.
 * Kept separate from `LOCALES` because formatting locale and UI locale are
 * different concerns — a Spanish UI may still need to format a value the way a
 * given region expects.
 */
export const LOCALE_FORMATTING: Record<Locale, string> = {
  es: 'es-ES',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
