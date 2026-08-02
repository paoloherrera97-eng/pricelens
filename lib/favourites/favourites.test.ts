import { describe, expect, it } from 'vitest';

import {
  MAX_FAVOURITES,
  addFavourite,
  isFavourite,
  pairOf,
  parseFavourites,
  removeFavourite,
  serialiseFavourites,
  toggleFavourite,
  type Favourite,
} from './favourites';

const THB_EUR: Favourite = { country: 'TH', to: 'EUR' };
const JPY_EUR: Favourite = { country: 'JP', to: 'EUR' };
const THB_USD: Favourite = { country: 'TH', to: 'USD' };
/** Spain and France both use the euro — same pair, different country. */
const ES_ARS: Favourite = { country: 'ES', to: 'ARS' };
const FR_ARS: Favourite = { country: 'FR', to: 'ARS' };

describe('pairOf', () => {
  it('resolves the country to the currency it is converting from', () => {
    expect(pairOf(THB_EUR)).toBe('THB→EUR');
  });

  it('returns null for a country we do not carry', () => {
    expect(pairOf({ country: 'XX', to: 'EUR' })).toBeNull();
  });
});

describe('addFavourite', () => {
  it('saves a pair', () => {
    expect(addFavourite([], THB_EUR)).toEqual([THB_EUR]);
  });

  it('puts the newest first', () => {
    expect(addFavourite([THB_EUR], JPY_EUR)).toEqual([JPY_EUR, THB_EUR]);
  });

  it('refuses an exact duplicate', () => {
    const saved = [THB_EUR];
    expect(addFavourite(saved, THB_EUR)).toBe(saved);
  });

  it('refuses a duplicate pair reached through a different country', () => {
    // Spain → ARS and France → ARS are both EUR → ARS. Offering both would be
    // two ways to reach one result.
    expect(addFavourite([ES_ARS], FR_ARS)).toEqual([ES_ARS]);
  });

  it('keeps pairs that differ only in the home currency', () => {
    expect(addFavourite([THB_EUR], THB_USD)).toHaveLength(2);
  });

  it('refuses an entry whose country we cannot resolve', () => {
    const saved = [THB_EUR];
    expect(addFavourite(saved, { country: 'XX', to: 'EUR' })).toBe(saved);
  });

  it(`drops the oldest past ${MAX_FAVOURITES}`, () => {
    const many: Favourite[] = ['TH', 'JP', 'US', 'GB', 'CH', 'BR', 'IN', 'MX']
      .slice(0, MAX_FAVOURITES)
      .map((country) => ({ country, to: 'EUR' }));

    const result = addFavourite(many, { country: 'AU', to: 'EUR' });

    expect(result).toHaveLength(MAX_FAVOURITES);
    expect(result[0]).toEqual({ country: 'AU', to: 'EUR' });
    expect(result).not.toContainEqual(many[MAX_FAVOURITES - 1]);
  });
});

describe('removeFavourite', () => {
  it('removes by pair, not by object identity', () => {
    expect(removeFavourite([ES_ARS, THB_EUR], FR_ARS)).toEqual([THB_EUR]);
  });

  it('leaves the list alone when the pair is not saved', () => {
    expect(removeFavourite([THB_EUR], JPY_EUR)).toEqual([THB_EUR]);
  });
});

describe('toggleFavourite', () => {
  it('saves what is not saved and unsaves what is', () => {
    const once = toggleFavourite([], THB_EUR);
    expect(isFavourite(once, THB_EUR)).toBe(true);
    expect(toggleFavourite(once, THB_EUR)).toEqual([]);
  });
});

describe('parseFavourites', () => {
  it('round-trips what it wrote', () => {
    const saved = [THB_EUR, JPY_EUR];
    expect(parseFavourites(serialiseFavourites(saved))).toEqual(saved);
  });

  it.each([['not json'], ['null'], ['{}'], ['"EUR"'], ['42']])(
    'returns null for %s so the caller can fall back',
    (raw) => {
      expect(parseFavourites(raw)).toBeNull();
    },
  );

  it('drops entries that are not favourites rather than rejecting the list', () => {
    // Stored data survives deploys: it can be hand-edited, corrupted, or
    // written by an older build. One bad row must not lose the good ones.
    const raw = JSON.stringify([
      THB_EUR,
      null,
      'EUR',
      { country: 'TH' },
      { to: 'EUR' },
      { country: 'TH', to: 'NOPE' },
      { country: 'XX', to: 'EUR' },
      { country: 42, to: 'EUR' },
      JPY_EUR,
    ]);

    expect(parseFavourites(raw)).toEqual([THB_EUR, JPY_EUR]);
  });

  it('collapses duplicates a previous version may have written', () => {
    expect(parseFavourites(JSON.stringify([ES_ARS, FR_ARS, ES_ARS]))).toEqual([ES_ARS]);
  });

  it('truncates an oversized stored list', () => {
    const raw = JSON.stringify(
      ['TH', 'JP', 'US', 'GB', 'CH', 'BR', 'IN', 'MX', 'AU', 'CA'].map((country) => ({
        country,
        to: 'EUR',
      })),
    );

    expect(parseFavourites(raw)).toHaveLength(MAX_FAVOURITES);
  });
});
