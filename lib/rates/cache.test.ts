import { describe, expect, it } from 'vitest';

import type { RateSnapshot } from '@/types';

import { parseCachedSnapshot, serialiseSnapshot } from './cache';

const SNAPSHOT: RateSnapshot = {
  base: 'USD',
  rates: { USD: 1, EUR: 0.92, THB: 35.4 },
  fetchedAt: '2026-08-03T10:00:00.000Z',
  source: 'exchangerate-api',
  degraded: false,
};

describe('serialiseSnapshot', () => {
  it('stores the snapshot as it arrived', () => {
    // `degraded` describes how the app got the table right now, not a property
    // of the data — it is set on the way out, not on the way in.
    expect(JSON.parse(serialiseSnapshot(SNAPSHOT))).toEqual(SNAPSHOT);
  });

  it('keeps the variants a table carried', () => {
    const withVariants: RateSnapshot = {
      ...SNAPSHOT,
      variants: {
        ARS: [{ id: 'blue', rate: 1465, source: 'test', fetchedAt: SNAPSHOT.fetchedAt }],
      },
    };
    expect(parseCachedSnapshot(serialiseSnapshot(withVariants))?.variants).toEqual(
      withVariants.variants,
    );
  });
});

describe('parseCachedSnapshot', () => {
  it('round-trips a snapshot, marked as fallback', () => {
    const restored = parseCachedSnapshot(serialiseSnapshot(SNAPSHOT));
    expect(restored).toEqual({ ...SNAPSHOT, degraded: true });
  });

  it('marks it degraded even if it was stored as live', () => {
    // Reading it back *is* the thing that makes it fallback data. Trusting the
    // stored flag would present yesterday's table as a live fetch, which is the
    // one thing this product must never do.
    expect(parseCachedSnapshot(serialiseSnapshot(SNAPSHOT))?.degraded).toBe(true);
  });

  it.each([
    ['not json', 'a truncated write'],
    ['null', 'a null payload'],
    ['[]', 'an array'],
    ['"USD"', 'a bare string'],
    ['{}', 'an empty object'],
  ])('rejects %o (%s)', (raw, _reason) => {
    expect(parseCachedSnapshot(raw)).toBeNull();
  });

  it.each([
    [{ ...SNAPSHOT, base: 'NOPE' }, 'a base we no longer carry'],
    [{ ...SNAPSHOT, base: 42 }, 'a base that is not a string'],
    [{ ...SNAPSHOT, fetchedAt: 'yesterday' }, 'an unparseable timestamp'],
    [{ ...SNAPSHOT, fetchedAt: undefined }, 'no timestamp at all'],
    [{ ...SNAPSHOT, source: undefined }, 'no source'],
    [{ ...SNAPSHOT, rates: {} }, 'a table with nothing in it'],
    [{ ...SNAPSHOT, rates: null }, 'no table'],
  ])('rejects %o — %s', (stored, _reason) => {
    expect(parseCachedSnapshot(JSON.stringify(stored))).toBeNull();
  });

  it.each([
    [0, 'zero, which would divide by nothing'],
    [-1, 'negative'],
    ['0.92', 'a string'],
    [null, 'null'],
  ])('discards the whole table over one rate of %o (%s)', (rate, _reason) => {
    // A single bad rate poisons every pair that triangulates through it, and a
    // half-working converter looks like a product bug rather than bad storage.
    const stored = { ...SNAPSHOT, rates: { ...SNAPSHOT.rates, EUR: rate } };
    expect(parseCachedSnapshot(JSON.stringify(stored))).toBeNull();
  });

  it('discards a table naming a currency we no longer carry', () => {
    const stored = { ...SNAPSHOT, rates: { ...SNAPSHOT.rates, XXX: 1.5 } };
    expect(parseCachedSnapshot(JSON.stringify(stored))).toBeNull();
  });

  it('keeps the original timestamp so the age shown is the real one', () => {
    expect(parseCachedSnapshot(serialiseSnapshot(SNAPSHOT))?.fetchedAt).toBe(SNAPSHOT.fetchedAt);
  });
});
