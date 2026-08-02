import { describe, expect, it } from 'vitest';

import { currencyForRegion, detectHomeCurrency, regionFromLocale } from './detect';

describe('regionFromLocale', () => {
  it.each([
    ['es-AR', 'AR'],
    ['en-GB', 'GB'],
    ['pt-BR', 'BR'],
    // Script subtags are why this uses Intl.Locale rather than splitting on '-'.
    ['zh-Hant-TW', 'TW'],
    // Casing is not guaranteed by the platform.
    ['es-ar', 'AR'],
    ['en-US-u-ca-gregory', 'US'],
  ])('reads the region from %s', (locale, expected) => {
    expect(regionFromLocale(locale)).toBe(expected);
  });

  it.each([
    ['es'],
    ['en'],
    // UN M.49 numeric regions name continents, not countries.
    ['es-419'],
  ])('returns null for %s, which names no country', (locale) => {
    expect(regionFromLocale(locale)).toBeNull();
  });

  it.each([[''], [null], [undefined], ['not a locale'], ['-'], ['???']])(
    'survives %s without throwing',
    (locale) => {
      expect(regionFromLocale(locale)).toBeNull();
    },
  );
});

describe('currencyForRegion', () => {
  it.each([
    ['AR', 'ARS'],
    ['JP', 'JPY'],
    ['TH', 'THB'],
    ['GB', 'GBP'],
    ['DE', 'EUR'],
  ])('maps %s to %s', (region, expected) => {
    expect(currencyForRegion(region)).toBe(expected);
  });

  it.each([['XX'], ['ZZ'], [''], [null]])('returns null for %s rather than guessing', (region) => {
    // A wrong home currency is worse than the default: it is wrong in a way the
    // user has no reason to check.
    expect(currencyForRegion(region)).toBeNull();
  });
});

describe('detectHomeCurrency', () => {
  it('prefers the locale region, which survives travel', async () => {
    // Someone from Argentina, currently in Thailand. Their home currency is
    // still ARS — that is the whole point of preferring the locale.
    await expect(detectHomeCurrency({ locale: 'es-AR', timeZone: 'Asia/Bangkok' })).resolves.toBe(
      'ARS',
    );
  });

  it('falls back to the timezone when the locale carries no region', async () => {
    await expect(
      detectHomeCurrency({ locale: 'es', timeZone: 'America/Argentina/Buenos_Aires' }),
    ).resolves.toBe('ARS');
  });

  it.each([
    ['Asia/Tokyo', 'JPY'],
    ['Europe/London', 'GBP'],
    ['America/New_York', 'USD'],
    ['Asia/Kolkata', 'INR'],
  ])('resolves %s to %s', async (timeZone, expected) => {
    await expect(detectHomeCurrency({ locale: null, timeZone })).resolves.toBe(expected);
  });

  it.each([
    ['Asia/Calcutta', 'INR'],
    ['Europe/Kiev', 'UAH'],
    ['Asia/Saigon', 'VND'],
  ])('resolves the legacy name %s, which browsers still report', async (timeZone, expected) => {
    // Both spellings are in the generated table, harvested from ICU, precisely
    // because engines disagree about which one is canonical — Node resolves
    // Asia/Kolkata *to* Asia/Calcutta, the opposite of what browsers do.
    await expect(detectHomeCurrency({ locale: null, timeZone })).resolves.toBe(expected);
  });

  it.each([
    [{ locale: null, timeZone: null }],
    [{ locale: 'en', timeZone: null }],
    [{ locale: 'en', timeZone: 'Mars/Olympus_Mons' }],
    [{ locale: 'zz-ZZ', timeZone: 'Etc/GMT+5' }],
    [{}],
  ])('returns null for %o so the configured default stands', async (signals) => {
    await expect(detectHomeCurrency(signals)).resolves.toBeNull();
  });

  it('never asks the browser for a permission', async () => {
    // The guarantee this feature rests on. Geolocation is the only permissioned
    // source of country, and nothing here may reach for it.
    const geolocation = { getCurrentPosition: () => expect.unreachable('geolocation used') };
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: geolocation,
      configurable: true,
    });

    await expect(detectHomeCurrency({ locale: 'es-AR', timeZone: 'Asia/Bangkok' })).resolves.toBe(
      'ARS',
    );
  });
});
