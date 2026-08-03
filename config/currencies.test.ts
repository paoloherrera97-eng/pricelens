import { describe, expect, it } from 'vitest';

import { CURRENCIES, currencyMarker, getCurrency, isCurrencyCode } from './currencies';

describe('currency metadata', () => {
  it('has a meaningful number of currencies for a travel product', () => {
    // Frankfurter/ECB would give ~31, which is why it was rejected (ADR-002).
    expect(CURRENCIES.length).toBeGreaterThan(140);
  });

  it('has no duplicate codes', () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('uses well-formed ISO 4217 codes', () => {
    for (const currency of CURRENCIES) {
      expect(currency.code).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('has a name, symbol and region for every currency', () => {
    for (const currency of CURRENCIES) {
      expect(currency.name.length, currency.code).toBeGreaterThan(0);
      expect(currency.symbol.length, currency.code).toBeGreaterThan(0);
      expect(currency.region.length, currency.code).toBeGreaterThan(0);
    }
  });

  /**
   * The critical invariant. `digits` drives rounding, and `Intl` drives display.
   * If they ever disagree we round to one precision and print another, which is
   * how a product quietly shows a wrong price (ADR-006).
   */
  it('agrees with Intl about minor units for every currency', () => {
    for (const currency of CURRENCIES) {
      const intlDigits = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency.code,
      }).resolvedOptions().maximumFractionDigits;

      expect(currency.digits, `${currency.code} minor units`).toBe(intlDigits);
    }
  });

  it('gets the well-known non-two-decimal currencies right', () => {
    // The cases a hardcoded toFixed(2) would silently corrupt.
    expect(getCurrency('JPY').digits).toBe(0);
    expect(getCurrency('KRW').digits).toBe(0);
    expect(getCurrency('VND').digits).toBe(0);
    expect(getCurrency('KWD').digits).toBe(3);
    expect(getCurrency('BHD').digits).toBe(3);
    expect(getCurrency('OMR').digits).toBe(3);
    expect(getCurrency('USD').digits).toBe(2);
  });

  it('covers the travel currencies that motivated the provider choice', () => {
    // Exactly the ones Frankfurter/ECB omits (ADR-002).
    for (const code of ['VND', 'AED', 'EGP', 'THB', 'IDR', 'TRY', 'MAD']) {
      expect(isCurrencyCode(code), code).toBe(true);
    }
  });
});

describe('isCurrencyCode', () => {
  it('accepts known codes and rejects everything else', () => {
    expect(isCurrencyCode('EUR')).toBe(true);
    expect(isCurrencyCode('XYZ')).toBe(false);
    expect(isCurrencyCode('eur')).toBe(false);
    expect(isCurrencyCode(null)).toBe(false);
    expect(isCurrencyCode(42)).toBe(false);
    expect(isCurrencyCode(undefined)).toBe(false);
  });
});

describe('getCurrency', () => {
  it('throws on an unknown code rather than guessing', () => {
    // Returning a default here would produce a plausible-looking wrong price.
    // @ts-expect-error — deliberately outside the CurrencyCode union.
    expect(() => getCurrency('XYZ')).toThrow(/Unknown currency/);
  });
});

describe('currencyMarker', () => {
  it.each([
    ['ARS', 'ARS', '28 currencies use "$"; in Argentina it reads as dollars'],
    ['USD', 'USD', 'the dollar has no more claim to "$" than the peso'],
    ['GBP', 'GBP', 'six currencies use "£"'],
    ['NOK', 'NOK', 'four use "kr"'],
    ['JPY', 'JPY', 'the yen shares "¥" with the yuan'],
  ])('gives %s the code, not its symbol (%s)', (code, expected, _reason) => {
    expect(currencyMarker(code as 'ARS')).toBe(expected);
  });

  it.each([
    ['EUR', '€'],
    ['THB', '฿'],
    ['VND', '₫'],
  ])('keeps %s on its own symbol %o', (code, expected) => {
    // A symbol only one currency wears identifies it perfectly, and is shorter.
    expect(currencyMarker(code as 'EUR')).toBe(expected);
  });

  it('never returns a marker that two currencies could share', () => {
    const markers = CURRENCIES.map((currency) => currencyMarker(currency.code));
    const duplicated = markers.filter((marker, i, all) => all.indexOf(marker) !== i);
    expect(duplicated).toEqual([]);
  });

  it('returns something for every currency we carry', () => {
    for (const currency of CURRENCIES) {
      expect(currencyMarker(currency.code).length).toBeGreaterThan(0);
    }
  });
});
