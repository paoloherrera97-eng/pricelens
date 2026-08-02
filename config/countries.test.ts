import { describe, expect, it } from 'vitest';

import { COUNTRIES, countryForCurrency, getCountry } from './countries';
import { isCurrencyCode } from './currencies';

describe('country data', () => {
  it('covers the world, not just a handful of destinations', () => {
    expect(COUNTRIES.length).toBeGreaterThan(180);
  });

  it('has no duplicate country codes', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('uses well-formed ISO 3166-1 alpha-2 codes', () => {
    for (const country of COUNTRIES) {
      expect(country.code, country.name).toMatch(/^[A-Z]{2}$/);
    }
  });

  /**
   * The invariant that matters: a country pointing at a currency the app cannot
   * convert would be a dead end the user reaches by picking their destination.
   */
  it('maps every country to a currency the app can actually convert', () => {
    for (const country of COUNTRIES) {
      expect(isCurrencyCode(country.currency), `${country.name} → ${country.currency}`).toBe(true);
    }
  });

  it('has a Spanish name and a flag for every country', () => {
    for (const country of COUNTRIES) {
      expect(country.name.length, country.code).toBeGreaterThan(1);
      // Two regional-indicator code points.
      expect([...country.flag], country.code).toHaveLength(2);
    }
  });

  it('is sorted by name, so the list reads naturally before any search', () => {
    const names = COUNTRIES.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
  });

  it('gets well-known destinations right', () => {
    expect(getCountry('JP')?.currency).toBe('JPY');
    expect(getCountry('TH')?.currency).toBe('THB');
    expect(getCountry('VN')?.currency).toBe('VND');
    expect(getCountry('GB')?.currency).toBe('GBP');
    expect(getCountry('CH')?.currency).toBe('CHF');
    // Euro adopters that a stale dataset would get wrong.
    expect(getCountry('HR')?.currency).toBe('EUR');
    expect(getCountry('DE')?.currency).toBe('EUR');
    // Dollarised economies that are not the United States.
    expect(getCountry('EC')?.currency).toBe('USD');
    expect(getCountry('SV')?.currency).toBe('USD');
  });

  it('returns undefined for an unknown country rather than guessing', () => {
    expect(getCountry('ZZ')).toBeUndefined();
  });
});

describe('countryForCurrency', () => {
  it('picks a recognisable representative for shared currencies', () => {
    // Twenty countries use the euro; the swap UI needs exactly one.
    expect(countryForCurrency('EUR')?.code).toBe('ES');
    expect(countryForCurrency('USD')?.code).toBe('US');
    expect(countryForCurrency('XOF')?.code).toBe('SN');
    expect(countryForCurrency('CHF')?.code).toBe('CH');
  });

  it('finds the single country for a sole-user currency', () => {
    expect(countryForCurrency('JPY')?.code).toBe('JP');
    expect(countryForCurrency('THB')?.code).toBe('TH');
  });

  it('returns a country for every currency any country uses', () => {
    // Otherwise a swap could leave the country selector with nothing to show.
    for (const country of COUNTRIES) {
      expect(countryForCurrency(country.currency), country.currency).toBeDefined();
    }
  });
});
