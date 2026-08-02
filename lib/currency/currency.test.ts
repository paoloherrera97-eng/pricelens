import { describe, expect, it } from 'vitest';

import { convert, getRate } from './convert';
import { describeAge, formatCurrency, formatRate, isStale } from './format';
import { parseAmount, sanitizeAmountInput } from './parse';

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
    // The bug a hardcoded toFixed(2) would produce: "¥1.340,00".
    const out = formatCurrency(1340, 'JPY', ES);
    expect(out).toContain('1340');
    expect(out).not.toMatch(/[.,]\d\d/);
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

  it('compacts very large amounts so the line cannot overflow (E6)', () => {
    const out = formatCurrency(2_500_000_000, 'VND', ES);
    expect(out.length).toBeLessThan(20);
  });

  it('returns empty string for non-finite input rather than "NaN €"', () => {
    expect(formatCurrency(Number.NaN, 'EUR', ES)).toBe('');
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
