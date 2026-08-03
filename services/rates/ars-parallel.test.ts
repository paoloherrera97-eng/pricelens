import { describe, expect, it } from 'vitest';

import { assertPlausible, parseQuotes } from './ars-parallel';

/**
 * This source is community-run rather than a central bank, which is exactly why
 * its payload is treated as hostile input. The tests below are mostly about
 * what the parser *refuses*: a bad quotation reaching the table would produce a
 * confident price rather than an error.
 */
const PAYLOAD = [
  { casa: 'oficial', compra: 990, venta: 1010, fechaActualizacion: '2026-08-02T12:00:00.000Z' },
  { casa: 'blue', compra: 1230, venta: 1270, fechaActualizacion: '2026-08-02T12:05:00.000Z' },
  { casa: 'tarjeta', compra: 1300, venta: 1300, fechaActualizacion: '2026-08-02T12:00:00.000Z' },
  { casa: 'mayorista', compra: 985, venta: 995, fechaActualizacion: '2026-08-02T12:00:00.000Z' },
];

describe('parseQuotes', () => {
  it('maps the houses it recognises and ignores the rest', () => {
    const quotes = parseQuotes(PAYLOAD);

    expect(quotes.map((q) => q.id).sort()).toEqual(['blue', 'card', 'official']);
  });

  it('uses the midpoint of buy and sell', () => {
    // A single side would imply a counterparty; this number is a reference for
    // judging a price, not a quote for a transaction.
    const blue = parseQuotes(PAYLOAD).find((q) => q.id === 'blue');
    expect(blue?.rate).toBe(1250);
  });

  it('accepts a quotation with only one side', () => {
    const quotes = parseQuotes([{ casa: 'blue', venta: 1270 }]);
    expect(quotes[0]?.rate).toBe(1270);
  });

  it('prefers the source timestamp over our clock', () => {
    const blue = parseQuotes(PAYLOAD).find((q) => q.id === 'blue');
    expect(blue?.fetchedAt).toBe('2026-08-02T12:05:00.000Z');
  });

  it('falls back to now when the timestamp is unusable', () => {
    const quotes = parseQuotes([{ casa: 'blue', venta: 1270, fechaActualizacion: 'ayer' }]);
    expect(Number.isNaN(Date.parse(quotes[0]!.fetchedAt))).toBe(false);
  });

  it.each([
    [{ casa: 'blue', compra: 0, venta: 0 }, 'zero on both sides'],
    [{ casa: 'blue', compra: -10, venta: -5 }, 'negative values'],
    [{ casa: 'blue', compra: 'mucho', venta: 'poco' }, 'non-numeric values'],
    [{ casa: 'blue' }, 'no values at all'],
    [{ compra: 1230, venta: 1270 }, 'no house'],
    [null, 'a null entry'],
  ])('skips %o (%s)', (entry, _reason) => {
    expect(() => parseQuotes([entry])).toThrow(/no usable quotations/);
  });

  it.each([['not an array'], [{}], [null], [42]])('rejects %o outright', (payload) => {
    expect(() => parseQuotes(payload)).toThrow();
  });

  it('keeps the good quotations when one entry is broken', () => {
    const quotes = parseQuotes([{ casa: 'blue', venta: 1270 }, { casa: 'oficial' }, null]);
    expect(quotes.map((q) => q.id)).toEqual(['blue']);
  });
});

describe('assertPlausible', () => {
  it('accepts a parallel rate far from official but not absurd', () => {
    // The gap is the whole reason this feature exists; 25% must pass.
    expect(() => assertPlausible(parseQuotes(PAYLOAD), 1000)).not.toThrow();
  });

  it.each([
    [1, 'a rate quoted in the wrong units'],
    [100_000, 'a placeholder or a different currency entirely'],
  ])('rejects the whole overlay against an official rate of %i (%s)', (official, _reason) => {
    // Dropping every quotation is deliberate: one bad number among good ones is
    // worse than falling back to the official rate, which is wrong-but-sane.
    expect(() => assertPlausible(parseQuotes(PAYLOAD), official)).toThrow(/official rate/);
  });

  it('rejects rather than dividing by a missing official rate', () => {
    expect(() => assertPlausible(parseQuotes(PAYLOAD), 0)).toThrow();
  });
});
