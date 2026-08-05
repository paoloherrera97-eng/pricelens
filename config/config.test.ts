import { describe, expect, it } from 'vitest';

import { APP_CONFIG } from './app';
import { isCurrencyCode } from './currencies';
import { FEATURES, isEnabled } from './features';
import { DEFAULT_LOCALE, LOCALES, LOCALE_FORMATTING, isLocale } from './i18n';
import { PROVIDER_CHAIN, RATE_PROVIDERS } from './providers';

describe('app config', () => {
  it('references only real currencies', () => {
    expect(isCurrencyCode(APP_CONFIG.baseCurrency)).toBe(true);
    expect(isCurrencyCode(APP_CONFIG.defaultHomeCurrency)).toBe(true);
    expect(isCurrencyCode(APP_CONFIG.defaultForeignCurrency)).toBe(true);
  });

  it('uses sane cache and timeout windows', () => {
    expect(APP_CONFIG.ratesRevalidateSeconds).toBeGreaterThan(0);
    expect(APP_CONFIG.ratesRequestTimeoutMs).toBeGreaterThan(0);
    // Rates must be considered stale no sooner than they are refreshed, or the
    // UI would warn about data it just fetched.
    expect(APP_CONFIG.ratesStaleAfterSeconds).toBeGreaterThanOrEqual(
      APP_CONFIG.ratesRevalidateSeconds,
    );
  });

  it('namespaces its storage keys', () => {
    for (const key of Object.values(APP_CONFIG.storageKeys)) {
      expect(key).toMatch(/^pricelens\./);
    }
  });
});

describe('provider registry', () => {
  it('resolves every provider in the chain', () => {
    for (const id of PROVIDER_CHAIN) {
      expect(RATE_PROVIDERS[id], id).toBeDefined();
      expect(RATE_PROVIDERS[id].id).toBe(id);
    }
  });

  it('has a non-empty chain', () => {
    expect(PROVIDER_CHAIN.length).toBeGreaterThan(0);
  });

  it('ships no provider that invents rates', () => {
    // ADR-013: offline continuity comes from replaying rates the user really
    // received, never from bundled numbers that would look equally real.
    for (const provider of Object.values(RATE_PROVIDERS)) {
      expect(provider.kind, provider.id).toBe('live');
      expect(provider.endpoint, provider.id).toBeTruthy();
    }
  });

  it('requires no API keys, so the app deploys with zero secrets', () => {
    for (const provider of Object.values(RATE_PROVIDERS)) {
      expect(provider.requiresApiKey, provider.id).toBe(false);
    }
  });

  it('only ever talks to https endpoints', () => {
    for (const provider of Object.values(RATE_PROVIDERS)) {
      if (provider.endpoint) {
        expect(provider.endpoint.startsWith('https://'), provider.id).toBe(true);
      }
    }
  });
});

describe('i18n config', () => {
  it('includes the default locale', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
    expect(isLocale('klingon')).toBe(false);
  });

  it('maps every locale to a formatting tag', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_FORMATTING[locale], locale).toBeTruthy();
      // Must be a tag Intl actually accepts, or formatting throws at runtime.
      expect(() => new Intl.NumberFormat(LOCALE_FORMATTING[locale])).not.toThrow();
    }
  });
});

describe('feature flags', () => {
  it('has the V1 feature set on and everything else off', () => {
    expect(isEnabled('pwa')).toBe(true);
    expect(isEnabled('offlineFallbackRates')).toBe(true);
    expect(isEnabled('persistHomeCurrency')).toBe(true);

    // Guards against a future version being switched on by accident.
    expect(FEATURES.ocr).toBe(false);
    expect(FEATURES.ai).toBe(false);
    expect(FEATURES.accounts).toBe(false);
    expect(FEATURES.darkMode).toBe(false);
  });
});
