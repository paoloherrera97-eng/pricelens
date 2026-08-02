/**
 * Centralised configuration barrel.
 *
 * `config/` is a leaf module: it holds data and settings, imports nothing from
 * the rest of the app, and may therefore be imported by any layer.
 */

export { APP_CONFIG } from './app';
export { CURRENCIES, getCurrency, isCurrencyCode } from './currencies';
export type { CurrencyCode, CurrencyMeta } from './currencies';
export { FEATURES, isEnabled } from './features';
export type { FeatureFlag } from './features';
export { DEFAULT_LOCALE, LOCALES, LOCALE_FORMATTING, isLocale } from './i18n';
export type { Locale } from './i18n';
export { PROVIDER_CHAIN, RATE_PROVIDERS } from './providers';
export type { ProviderConfig, ProviderId } from './providers';
