import { describe, expect, it, vi } from 'vitest';

import { parseResponse } from './exchangerate-api';
import { RatesUnavailableError, resolveRates } from './index';
import type { RateProvider } from './types';

const VALID = {
  result: 'success',
  base_code: 'USD',
  time_last_update_unix: 1_780_000_000,
  rates: { USD: 1, EUR: 0.92, THB: 35, JPY: 150 },
};

describe('parseResponse', () => {
  it('accepts a well-formed payload', () => {
    const snapshot = parseResponse(VALID, 'USD');

    expect(snapshot.base).toBe('USD');
    expect(snapshot.rates.EUR).toBe(0.92);
    expect(snapshot.degraded).toBe(false);
    expect(snapshot.source).toBe('exchangerate-api');
  });

  it('uses the provider’s own update time when given one', () => {
    expect(parseResponse(VALID, 'USD').fetchedAt).toBe(
      new Date(1_780_000_000 * 1000).toISOString(),
    );
  });

  it('falls back to now when the provider omits a timestamp', () => {
    const { time_last_update_unix: _omitted, ...withoutTime } = VALID;
    expect(() => new Date(parseResponse(withoutTime, 'USD').fetchedAt)).not.toThrow();
  });

  // Each of these would otherwise put `undefined` or a wrong number into
  // arithmetic that produces a price (PRD E9).
  it.each([
    ['not an object', 'null', null],
    ['a string', 'string', 'nope'],
    ['an error result', 'result!=success', { ...VALID, result: 'error' }],
    ['no base_code', 'missing base', { ...VALID, base_code: undefined }],
    ['no rates', 'missing rates', { ...VALID, rates: undefined }],
    ['empty rates', 'empty rates', { ...VALID, rates: {} }],
  ])('rejects %s', (_label, _why, payload) => {
    expect(() => parseResponse(payload, 'USD')).toThrow();
  });

  it('rejects a payload whose base is not the one we asked for', () => {
    // Accepting it silently would make every conversion wrong.
    expect(() => parseResponse({ ...VALID, base_code: 'EUR' }, 'USD')).toThrow(/does not match/);
  });

  it('rejects a payload that omits its own base currency', () => {
    expect(() => parseResponse({ ...VALID, rates: { EUR: 0.92 } }, 'USD')).toThrow(/omits/);
  });

  it('drops individual bad entries but keeps the usable table', () => {
    const snapshot = parseResponse(
      {
        ...VALID,
        rates: { USD: 1, EUR: 0.92, BAD: 'x', ZERO: 0, NEG: -3, INF: Number.POSITIVE_INFINITY },
      },
      'USD',
    );

    expect(snapshot.rates.EUR).toBe(0.92);
    // A currency we drop simply disappears from the selectors (PRD E12).
    for (const code of ['BAD', 'ZERO', 'NEG', 'INF']) {
      expect(snapshot.rates[code]).toBeUndefined();
    }
  });
});

const snapshotFrom = (id: string) => ({
  base: 'USD' as const,
  rates: { USD: 1, EUR: 0.92 },
  fetchedAt: '2026-08-02T12:00:00.000Z',
  source: id,
  degraded: false,
});

function stub(id: string, behaviour: 'ok' | 'fail'): RateProvider {
  return {
    id,
    fetchRates:
      behaviour === 'ok'
        ? vi.fn().mockResolvedValue(snapshotFrom(id))
        : vi.fn().mockRejectedValue(new Error(`${id} is down`)),
  } as unknown as RateProvider;
}

describe('resolveRates', () => {
  it('returns the first provider that succeeds', async () => {
    const first = stub('a', 'ok');
    const second = stub('b', 'ok');

    const snapshot = await resolveRates(
      'USD',
      ['a', 'b'] as never,
      {
        a: first,
        b: second,
      } as never,
    );

    expect(snapshot.source).toBe('a');
    // The chain must stop, not fan out to every provider.
    expect(second.fetchRates).not.toHaveBeenCalled();
  });

  it('advances past a failing provider to the next one', async () => {
    const snapshot = await resolveRates(
      'USD',
      ['a', 'b'] as never,
      {
        a: stub('a', 'fail'),
        b: stub('b', 'ok'),
      } as never,
    );

    expect(snapshot.source).toBe('b');
  });

  it('throws RatesUnavailableError when every provider fails', async () => {
    // No bundled-snapshot fallback by design (ADR-013): the app says rates are
    // unavailable rather than showing numbers nobody fetched.
    const error = await resolveRates(
      'USD',
      ['a', 'b'] as never,
      {
        a: stub('a', 'fail'),
        b: stub('b', 'fail'),
      } as never,
    ).catch((e) => e);

    expect(error).toBeInstanceOf(RatesUnavailableError);
    expect(error.attempts).toHaveLength(2);
    expect(error.attempts[0].reason).toContain('a is down');
  });

  it('records an unregistered provider instead of crashing', async () => {
    const error = await resolveRates('USD', ['nope' as never], {}).catch((e) => e);

    expect(error).toBeInstanceOf(RatesUnavailableError);
    expect(error.attempts).toEqual([{ provider: 'nope', reason: 'not registered' }]);
  });

  it('throws on an empty chain rather than returning nothing', async () => {
    await expect(resolveRates('USD', [], {})).rejects.toBeInstanceOf(RatesUnavailableError);
  });
});
