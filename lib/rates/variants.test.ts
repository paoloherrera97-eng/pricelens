import { describe, expect, it } from 'vitest';

import type { RateTable, RateVariant } from '@/types';

import {
  DEFAULT_VARIANT_ID,
  applyVariant,
  parseSelection,
  resolveVariant,
  serialiseSelection,
  variantsFor,
} from './variants';

const variant = (id: string, rate: number): RateVariant => ({
  id,
  rate,
  source: 'test',
  fetchedAt: '2026-08-02T00:00:00.000Z',
});

const OFFICIAL = variant('official', 1000);
const BLUE = variant('blue', 1250);
const CARD = variant('card', 1300);
const ALL = [OFFICIAL, BLUE, CARD];

const TABLE: RateTable = { USD: 1, EUR: 0.92, ARS: 1000 };

describe('variantsFor', () => {
  it('offers the quotations of a currency that has several', () => {
    expect(variantsFor({ ARS: ALL }, 'ARS')).toHaveLength(3);
  });

  it('presents them in a fixed order regardless of what the source returned', () => {
    // Cash first because it is the default and the commonest; official last
    // because it is the one almost no visitor transacts at. The source's own
    // ordering is an implementation detail of the source.
    expect(variantsFor({ ARS: ALL }, 'ARS').map((v) => v.id)).toEqual(['blue', 'card', 'official']);
    expect(variantsFor({ ARS: [...ALL].reverse() }, 'ARS').map((v) => v.id)).toEqual([
      'blue',
      'card',
      'official',
    ]);
  });

  it('keeps an unrecognised quotation rather than dropping it', () => {
    const mep = { ...OFFICIAL, id: 'mep' };
    expect(variantsFor({ ARS: [mep, BLUE] }, 'ARS').map((v) => v.id)).toEqual(['blue', 'mep']);
  });

  it('never mutates the list it was given', () => {
    const source = [...ALL];
    variantsFor({ ARS: source }, 'ARS');
    expect(source.map((v) => v.id)).toEqual(['official', 'blue', 'card']);
  });

  it.each([
    [undefined, 'ARS', 'no variants at all'],
    [{ ARS: ALL }, 'THB', 'a currency without any'],
    [{ ARS: [BLUE] }, 'ARS', 'a single quotation, which is not a choice'],
    [{ ARS: [] }, 'ARS', 'an empty list'],
  ])('returns nothing for %o / %s (%s)', (variants, currency, _reason) => {
    expect(variantsFor(variants, currency)).toEqual([]);
  });
});

describe('resolveVariant', () => {
  it('honours what the traveler chose', () => {
    expect(resolveVariant(ALL, { ARS: 'card' }, 'ARS')).toBe(CARD);
  });

  it(`falls back to ${DEFAULT_VARIANT_ID} when nothing was chosen`, () => {
    expect(resolveVariant(ALL, {}, 'ARS')).toBe(BLUE);
  });

  it('ignores a choice made for a different currency', () => {
    expect(resolveVariant(ALL, { VES: 'official' }, 'ARS')).toBe(BLUE);
  });

  it('falls through when a stored choice no longer exists', () => {
    // A preference written by an older deploy must not leave the screen with
    // no rate at all.
    expect(resolveVariant(ALL, { ARS: 'mep' }, 'ARS')).toBe(BLUE);
  });

  it('takes the first quotation when even the default is absent', () => {
    expect(resolveVariant([OFFICIAL, CARD], { ARS: 'mep' }, 'ARS')).toBe(OFFICIAL);
  });

  it('returns null when there is nothing to resolve', () => {
    expect(resolveVariant([], { ARS: 'blue' }, 'ARS')).toBeNull();
  });
});

describe('applyVariant', () => {
  it('substitutes exactly one rate', () => {
    const result = applyVariant(TABLE, 'ARS', BLUE);

    expect(result.ARS).toBe(1250);
    expect(result.USD).toBe(1);
    expect(result.EUR).toBe(0.92);
  });

  it('never mutates the table it was given', () => {
    applyVariant(TABLE, 'ARS', BLUE);
    expect(TABLE.ARS).toBe(1000);
  });

  it('returns the same object when there is nothing to substitute', () => {
    // Identity, not equality: every destination that is not Argentina must
    // allocate nothing and keep downstream memoisation stable.
    expect(applyVariant(TABLE, 'ARS', null)).toBe(TABLE);
    expect(applyVariant(TABLE, 'ARS', OFFICIAL)).toBe(TABLE);
  });

  it.each([
    [variant('blue', 0)],
    [variant('blue', -5)],
    [variant('blue', Number.NaN)],
    [variant('blue', Number.POSITIVE_INFINITY)],
  ])('refuses %o rather than poisoning the table', (bad) => {
    // A corrupt rate reaching the arithmetic produces a price, not an error.
    expect(applyVariant(TABLE, 'ARS', bad)).toBe(TABLE);
  });
});

describe('parseSelection', () => {
  it('round-trips what it wrote', () => {
    const selection = { ARS: 'card' };
    expect(parseSelection(serialiseSelection(selection))).toEqual(selection);
  });

  it.each([['not json'], ['null'], ['[]'], ['"blue"'], ['42']])(
    'returns null for %s so the caller can fall back',
    (raw) => {
      expect(parseSelection(raw)).toBeNull();
    },
  );

  it('drops entries that are not a currency-to-variant mapping', () => {
    const raw = JSON.stringify({
      ARS: 'blue',
      ars: 'blue',
      ARSS: 'blue',
      VES: 42,
      COP: 'a-very-long-identifier-indeed',
      BRL: 'official',
    });

    expect(parseSelection(raw)).toEqual({ ARS: 'blue', BRL: 'official' });
  });
});
