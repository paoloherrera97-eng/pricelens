import { describe, expect, it } from 'vitest';

import {
  MAX_HISTORY,
  addHistoryEntry,
  parseHistory,
  removeHistoryEntry,
  serialiseHistory,
  type HistoryEntry,
  type NewHistoryEntry,
} from './history';

const AT = '2026-08-05T10:00:00.000Z';

const CONVERSION: NewHistoryEntry = {
  country: 'TH',
  from: 'THB',
  to: 'EUR',
  amount: '1.890',
  rate: 0.026,
  result: 49.14,
};

const entry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  ...CONVERSION,
  at: AT,
  ...overrides,
});

describe('addHistoryEntry', () => {
  it('records a conversion with the moment it happened', () => {
    expect(addHistoryEntry([], CONVERSION, AT)).toEqual([entry()]);
  });

  it('puts the newest first', () => {
    const first = addHistoryEntry([], CONVERSION, '2026-08-05T10:00:00.000Z');
    const second = addHistoryEntry(
      first,
      { ...CONVERSION, country: 'AR', from: 'ARS' },
      '2026-08-05T11:00:00.000Z',
    );
    expect(second.map((e) => e.from)).toEqual(['ARS', 'THB']);
  });

  it('refreshes the top entry instead of stacking a consecutive repeat', () => {
    // The field converts on every keystroke; "1", "12", "120" must not become
    // three memories of typing one number.
    const once = addHistoryEntry([], CONVERSION, '2026-08-05T10:00:00.000Z');
    const twice = addHistoryEntry(once, CONVERSION, '2026-08-05T10:00:30.000Z');

    expect(twice).toHaveLength(1);
    expect(twice[0]?.at).toBe('2026-08-05T10:00:30.000Z');
  });

  it('takes a newer rate for the same conversion', () => {
    const once = addHistoryEntry([], CONVERSION, AT);
    const again = addHistoryEntry(once, { ...CONVERSION, rate: 0.027, result: 51.03 }, AT);
    expect(again).toHaveLength(1);
    expect(again[0]?.rate).toBe(0.027);
  });

  it('keeps a return visit that is not consecutive', () => {
    // Coming back to the same price after looking at another one is a real
    // second lookup, and the list should say so.
    let history = addHistoryEntry([], CONVERSION, '2026-08-05T10:00:00.000Z');
    history = addHistoryEntry(
      history,
      { ...CONVERSION, amount: '500' },
      '2026-08-05T10:01:00.000Z',
    );
    history = addHistoryEntry(history, CONVERSION, '2026-08-05T10:02:00.000Z');

    expect(history.map((e) => e.amount)).toEqual(['1.890', '500', '1.890']);
  });

  it.each([
    [{ country: 'VN' }, 'a different country'],
    [{ to: 'JPY' as const }, 'a different home currency'],
    [{ amount: '2.000' }, 'a different amount'],
    [{ variantId: 'blue' }, 'a different quotation'],
  ])('treats %o as a new conversion (%s)', (difference, _reason) => {
    const once = addHistoryEntry([], CONVERSION, AT);
    expect(addHistoryEntry(once, { ...CONVERSION, ...difference }, AT)).toHaveLength(2);
  });

  it(`never grows past ${MAX_HISTORY}`, () => {
    let history: readonly HistoryEntry[] = [];
    for (let i = 0; i < MAX_HISTORY + 8; i++) {
      history = addHistoryEntry(history, { ...CONVERSION, amount: String(i) }, AT);
    }
    expect(history).toHaveLength(MAX_HISTORY);
    // The oldest fell off the end, not the newest.
    expect(history[0]?.amount).toBe(String(MAX_HISTORY + 7));
  });

  it('never mutates the list it was given', () => {
    const original = addHistoryEntry([], CONVERSION, AT);
    addHistoryEntry(original, { ...CONVERSION, amount: '5' }, AT);
    expect(original).toHaveLength(1);
  });
});

describe('removeHistoryEntry', () => {
  it('drops the entry with that timestamp and leaves the rest', () => {
    const history = [entry({ at: '2026-08-04T09:00:00.000Z' }), entry({ at: AT })];
    expect(removeHistoryEntry(history, AT).map((e) => e.at)).toEqual(['2026-08-04T09:00:00.000Z']);
  });

  it('is a no-op for a timestamp that is not there', () => {
    const history = [entry()];
    expect(removeHistoryEntry(history, '2020-01-01T00:00:00.000Z')).toEqual(history);
  });
});

describe('parseHistory', () => {
  it('round-trips what it wrote', () => {
    const history = [entry(), entry({ at: '2026-08-04T10:00:00.000Z', variantId: 'blue' })];
    expect(parseHistory(serialiseHistory(history))).toEqual(history);
  });

  it.each([['not json'], ['null'], ['{}'], ['"THB"'], ['42']])(
    'returns null for %s so the caller can fall back',
    (raw) => {
      expect(parseHistory(raw)).toBeNull();
    },
  );

  it('returns an empty list for an empty array rather than null', () => {
    expect(parseHistory('[]')).toEqual([]);
  });

  it.each([
    [{ country: 'ZZ' }, 'a country this build no longer carries'],
    [{ from: 'NOPE' }, 'an unknown source currency'],
    [{ to: 'NOPE' }, 'an unknown home currency'],
    [{ at: 'yesterday' }, 'an unparseable timestamp'],
    [{ at: 42 }, 'a timestamp that is not a string'],
    [{ amount: 1890 }, 'an amount that is not the text the field held'],
    [{ rate: 0 }, 'a rate of zero'],
    [{ rate: -1 }, 'a negative rate'],
    [{ rate: 'fast' }, 'a rate that is not a number'],
    [{ result: Number.NaN }, 'a non-finite result'],
    [{ variantId: 7 }, 'a quotation id that is not a string'],
  ])('drops an entry with %o — %s', (corruption, _reason) => {
    // An entry that cannot resolve is a row that does nothing when tapped.
    expect(parseHistory(JSON.stringify([{ ...entry(), ...corruption }]))).toEqual([]);
  });

  it('keeps the sound entries and drops only the broken ones', () => {
    const raw = JSON.stringify([
      entry(),
      { ...entry({ at: '2026-08-04T10:00:00.000Z' }), rate: 0 },
    ]);
    expect(parseHistory(raw)).toHaveLength(1);
  });

  it('sorts newest first regardless of the order it was stored in', () => {
    const raw = JSON.stringify([
      entry({ at: '2026-08-01T10:00:00.000Z' }),
      entry({ at: '2026-08-05T10:00:00.000Z' }),
      entry({ at: '2026-08-03T10:00:00.000Z' }),
    ]);
    expect(parseHistory(raw)?.map((e) => e.at.slice(8, 10))).toEqual(['05', '03', '01']);
  });

  it('collapses entries sharing a timestamp, which is the identity', () => {
    // Two rows with the same key make deletion ambiguous.
    expect(parseHistory(JSON.stringify([entry(), entry()]))).toHaveLength(1);
  });

  it(`caps a list an older build may have let grow past ${MAX_HISTORY}`, () => {
    const raw = JSON.stringify(
      Array.from({ length: MAX_HISTORY + 10 }, (_, i) =>
        entry({ at: new Date(Date.UTC(2026, 0, i + 1)).toISOString() }),
      ),
    );
    expect(parseHistory(raw)).toHaveLength(MAX_HISTORY);
  });

  it('omits `variantId` rather than storing it as undefined', () => {
    const parsed = parseHistory(serialiseHistory([entry()]));
    expect(parsed?.[0] && 'variantId' in parsed[0]).toBe(false);
  });
});
