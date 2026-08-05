import { describe, expect, it } from 'vitest';

import { convert, getRate } from './convert';
import { describeAge, formatCurrency, formatRate, isStale, readableRate } from './format';
import { normaliseAmount, parseAmount, sanitizeAmountInput } from './parse';

const ES = 'es-ES';

/** A USD-anchored table, the shape the app actually fetches (ADR-001). */
const TABLE = {
  USD: 1,
  EUR: 0.92,
  THB: 35,
  JPY: 150,
  KWD: 0.31,
  VND: 25_000,
};

describe('sanitizeAmountInput', () => {
  it('drops characters that cannot belong in an amount', () => {
    // Silently, with no error state — PRD FR-1.
    expect(sanitizeAmountInput('12a3')).toBe('123');
    expect(sanitizeAmountInput('฿1.890')).toBe('1.890');
    expect(sanitizeAmountInput('-45')).toBe('45');
    expect(sanitizeAmountInput('12e5')).toBe('125');
  });

  it('keeps digits and both decimal separators', () => {
    expect(sanitizeAmountInput('1.234,56')).toBe('1.234,56');
  });
});

describe('normaliseAmount', () => {
  it.each([
    ['12,50', '12.50', 'a trailing zero that `Number` would drop'],
    ['12.50', '12.50', 'the same price written the American way'],
    ['1.234,56', '1234.56', 'a Spanish formatted number'],
    ['1,234.56', '1234.56', 'an English formatted number'],
    ['1.890', '1890', 'a lone separator grouping a thousand'],
    ['1 890', '1890', 'thin spaces from some keyboards'],
    ['12,', '12', 'a separator with nothing after it'],
    ['', '', 'empty input'],
  ])('rewrites %o as %o (%s)', (raw, expected, _reason) => {
    // Text, not a number: the amount field re-displays this, and "12,5" is not
    // what someone who typed a price with cents wrote.
    expect(normaliseAmount(raw)).toBe(expected);
  });

  it('rejects what is not a number at all', () => {
    expect(normaliseAmount('abc')).toBeNull();
  });

  it('is the single reading parseAmount gives the conversion', () => {
    for (const raw of ['12,50', '1.234,56', '1,234.56', '1.890', '0.500']) {
      expect(parseAmount(raw)).toBe(Number(normaliseAmount(raw)));
    }
  });
});

describe('parseAmount', () => {
  it('treats empty input as zero, not as an error (E1)', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('   ')).toBe(0);
  });

  it('parses plain integers and zero (E2)', () => {
    expect(parseAmount('0')).toBe(0);
    expect(parseAmount('1890')).toBe(1890);
  });

  it('accepts either decimal separator (E3)', () => {
    // A European traveler types 12,50 and must not get 1250.
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('12,50')).toBe(12.5);
  });

  it('resolves mixed separators by taking the rightmost as decimal', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56);
    expect(parseAmount('1,234.56')).toBe(1234.56);
  });

  it('treats a repeated separator as grouping', () => {
    expect(parseAmount('1.234.567')).toBe(1234567);
    expect(parseAmount('1,234,567')).toBe(1234567);
  });

  it('reads a lone separator with three trailing digits as grouping', () => {
    // The app ships in Spanish, where "." groups thousands: a price pasted as
    // "1.890" means one thousand eight hundred ninety, not 1.89.
    expect(parseAmount('1.890')).toBe(1890);
    expect(parseAmount('1,890')).toBe(1890);
    expect(parseAmount('25.000')).toBe(25000);
    expect(parseAmount('250.000')).toBe(250000);
  });

  it('still reads a lone separator as decimal when grouping is implausible', () => {
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('0.500')).toBe(0.5); // nobody writes zero thousands
    expect(parseAmount('0,750')).toBe(0.75);
    expect(parseAmount('1234.5')).toBe(1234.5);
    expect(parseAmount('12.3456')).toBe(12.3456);
  });

  it('ignores spaces used as thousands separators', () => {
    expect(parseAmount('1 890')).toBe(1890);
    expect(parseAmount('250 000')).toBe(250000);
  });

  it('tolerates a trailing separator mid-typing', () => {
    // "12." is a user halfway through typing; the result must not blink out.
    expect(parseAmount('12.')).toBe(12);
    expect(parseAmount('12,')).toBe(12);
  });

  it('returns null for input that is not a number', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('12abc')).toBeNull();
  });

  it('handles very large amounts without losing precision (E6)', () => {
    expect(parseAmount('250000000')).toBe(250_000_000);
  });
});

describe('getRate', () => {
  it('returns 1 for the same currency (E8 guard)', () => {
    expect(getRate(TABLE, 'EUR', 'EUR')).toBe(1);
  });

  it('derives a pair rate by triangulation through the base', () => {
    // THB → EUR = 0.92 / 35
    expect(getRate(TABLE, 'THB', 'EUR')).toBeCloseTo(0.92 / 35, 12);
  });

  it('works when neither currency is the base', () => {
    expect(getRate(TABLE, 'JPY', 'THB')).toBeCloseTo(35 / 150, 12);
  });

  it('is symmetric: converting back returns the original', () => {
    const forward = getRate(TABLE, 'THB', 'JPY')!;
    const backward = getRate(TABLE, 'JPY', 'THB')!;
    expect(forward * backward).toBeCloseTo(1, 12);
  });

  it('returns null for a currency missing from the table (E12)', () => {
    // Better an honest "unavailable" than a confidently wrong number.
    expect(getRate(TABLE, 'XYZ', 'EUR')).toBeNull();
    expect(getRate(TABLE, 'EUR', 'XYZ')).toBeNull();
  });

  it('rejects corrupt rates rather than producing Infinity', () => {
    expect(getRate({ ...TABLE, THB: 0 }, 'THB', 'EUR')).toBeNull();
    expect(getRate({ ...TABLE, THB: -1 }, 'THB', 'EUR')).toBeNull();
    expect(getRate({ ...TABLE, THB: Number.NaN }, 'THB', 'EUR')).toBeNull();
  });
});

describe('convert', () => {
  it('converts a realistic travel amount', () => {
    // ฿1,890 at 35 THB/USD and 0.92 EUR/USD ≈ €49.68
    expect(convert(1890, TABLE, 'THB', 'EUR')).toBeCloseTo(49.68, 2);
  });

  it('returns zero for a zero amount', () => {
    expect(convert(0, TABLE, 'THB', 'EUR')).toBe(0);
  });

  it('does not round — rounding belongs to display (ADR-006)', () => {
    const result = convert(1, TABLE, 'JPY', 'EUR')!;
    expect(result).toBeCloseTo(0.92 / 150, 12);
    // If this had been rounded to 2dp it would be 0.01, losing the precision the
    // formatter needs to show $0.0061.
    expect(result).not.toBe(0.01);
  });

  it('returns null for a non-finite amount', () => {
    expect(convert(Number.NaN, TABLE, 'THB', 'EUR')).toBeNull();
    expect(convert(Number.POSITIVE_INFINITY, TABLE, 'THB', 'EUR')).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('uses zero decimals for zero-decimal currencies (E4)', () => {
    const out = formatCurrency(1340, 'JPY', ES);
    // Grouped, but with no minor units at all — the bug a hardcoded
    // toFixed(2) would produce is "¥1.340,00".
    expect(out).toContain('1.340');
    expect(out).not.toMatch(/,\d\d/);
  });

  it('uses three decimals for three-decimal currencies (E5)', () => {
    expect(formatCurrency(1.2345, 'KWD', ES)).toMatch(/1,235|1\.235/);
  });

  it('uses two decimals for ordinary currencies', () => {
    expect(formatCurrency(49.6789, 'EUR', ES)).toMatch(/49,68/);
  });

  it('keeps meaningful precision below the smallest unit (E7)', () => {
    // $0.00 would be a lie; $0.0031 is useful.
    const out = formatCurrency(0.0031, 'USD', ES);
    expect(out).not.toMatch(/0[.,]00\b/);
    expect(out).toMatch(/0[.,]0031|0[.,]0031/);
  });

  it('formats zero plainly rather than with false precision', () => {
    expect(formatCurrency(0, 'EUR', ES)).toMatch(/0,00/);
  });

  it('writes very large amounts in full, never compacted (E6)', () => {
    // Compact notation collapsed distinct prices onto one string and read
    // differently in Spanish and English. Fitting the result is `text-fit`'s
    // job, not the formatter's.
    expect(formatCurrency(25_399_974_600, 'VND', ES)).toContain('25.399.974.600');
    expect(formatCurrency(1_250_000, 'EUR', ES)).toContain('1.250.000');
  });

  it.each([
    [999_999, 'VND'],
    [1_000_000, 'VND'],
    [1_000_001, 'VND'],
  ])('gives %d %s a string of its own', (value, code) => {
    // The defect this replaces: 999.999 and 1.000.000 both rendered "25,4 mil M₫".
    const others = [999_999, 1_000_000, 1_000_001].filter((v) => v !== value);
    for (const other of others) {
      expect(formatCurrency(value, code as 'VND', ES)).not.toBe(
        formatCurrency(other, code as 'VND', ES),
      );
    }
  });

  it.each([['mil M'], ['B'], ['M']])('never emits the compact marker %o', (marker) => {
    for (const value of [1e9, 2.5e9, 1e12, 25_399_974_600]) {
      expect(formatCurrency(value, 'VND', ES)).not.toContain(marker);
    }
  });

  it('returns empty string for non-finite input rather than "NaN €"', () => {
    expect(formatCurrency(Number.NaN, 'EUR', ES)).toBe('');
  });
});

describe('readableRate', () => {
  it('inverts a rate below 1 so the figure is one a person can read', () => {
    // The line this replaces: "1 ARS = 0,000628 EUR".
    const shown = readableRate(0.92 / 1010, 'ARS', 'EUR');
    expect(shown).toMatchObject({ from: 'EUR', to: 'ARS' });
    expect(shown.rate).toBeGreaterThan(1);
  });

  it('leaves a rate of 1 or more alone', () => {
    expect(readableRate(35.4, 'USD', 'THB')).toEqual({ from: 'USD', to: 'THB', rate: 35.4 });
    expect(readableRate(1, 'EUR', 'EUR')).toEqual({ from: 'EUR', to: 'EUR', rate: 1 });
  });

  it('always yields a figure of at least 1, whichever way the pair runs', () => {
    for (const rate of [0.92, 0.0000362, 25_400, 1.0869, 0.5]) {
      expect(readableRate(rate, 'USD', 'EUR').rate).toBeGreaterThanOrEqual(1);
    }
  });

  it.each([[0], [-1], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'hands back %o untouched rather than dividing by it',
    (rate) => {
      // 1/0 is Infinity, and "1 EUR = ∞ ARS" is worse than the empty string
      // `formatRate` already returns for these.
      expect(readableRate(rate, 'ARS', 'EUR')).toEqual({ from: 'ARS', to: 'EUR', rate });
    },
  );

  it('round-trips: inverting the inverse returns the original pair', () => {
    const once = readableRate(0.0000362, 'VND', 'EUR');
    expect(readableRate(once.rate, once.from, once.to)).toEqual(once);
  });
});

describe('formatRate', () => {
  it('keeps significant digits for very small rates', () => {
    // 0.00 would make the rate line meaningless.
    const out = formatRate(0.0000262, ES);
    expect(out).not.toMatch(/^0[.,]00$/);
    expect(out).toContain('262');
  });

  it('formats ordinary rates readably', () => {
    expect(formatRate(1.0869, ES)).toMatch(/1,0869/);
  });

  it('returns empty string for an invalid rate', () => {
    expect(formatRate(0, ES)).toBe('');
    expect(formatRate(Number.NaN, ES)).toBe('');
  });
});

describe('describeAge', () => {
  const now = new Date('2026-08-02T12:00:00Z');
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

  it('buckets ages into the unit the UI announces', () => {
    expect(describeAge(ago(10), now)).toEqual({ unit: 'now' });
    expect(describeAge(ago(300), now)).toEqual({ unit: 'minutes', count: 5 });
    expect(describeAge(ago(7200), now)).toEqual({ unit: 'hours', count: 2 });
    expect(describeAge(ago(172_800), now)).toEqual({ unit: 'days', count: 2 });
  });

  it('never reports a negative age from clock skew', () => {
    const future = new Date(now.getTime() + 60_000).toISOString();
    expect(describeAge(future, now)).toEqual({ unit: 'now' });
  });

  it('returns null for an unparseable timestamp', () => {
    expect(describeAge('not-a-date', now)).toBeNull();
  });
});

describe('isStale', () => {
  const now = new Date('2026-08-02T12:00:00Z');
  const DAY = 86_400;

  it('is false for fresh rates and true past the threshold', () => {
    expect(isStale(new Date(now.getTime() - 60_000).toISOString(), now, DAY)).toBe(false);
    expect(isStale(new Date(now.getTime() - 2 * DAY * 1000).toISOString(), now, DAY)).toBe(true);
  });

  it('treats an unparseable timestamp as stale', () => {
    // Unknown age must degrade toward caution, never toward false confidence.
    expect(isStale('nonsense', now, DAY)).toBe(true);
  });
});
