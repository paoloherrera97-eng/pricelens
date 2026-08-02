import { describe, expect, it } from 'vitest';

import { buildShareQuery, buildShareUrl, parseShareParams } from './url';

describe('parseShareParams', () => {
  it('reads a link this app produced', () => {
    expect(parseShareParams('?country=TH&to=EUR&amount=1.890')).toEqual({
      country: 'TH',
      to: 'EUR',
      amount: '1.890',
    });
  });

  it('accepts lower-case codes, which people type', () => {
    expect(parseShareParams('?country=th&to=eur')).toEqual({ country: 'TH', to: 'EUR' });
  });

  it('keeps the valid parts of a link whose other parts are broken', () => {
    // A chat client that truncates or mangles a URL should still restore what
    // survived, rather than silently discarding the whole thing.
    expect(parseShareParams('?country=TH&to=NOPE&amount=abc')).toEqual({ country: 'TH' });
  });

  it.each([
    ['?country=XX', 'a country we do not carry'],
    ['?to=ZZZ', 'a currency we do not carry'],
    ['?amount=', 'an empty amount'],
    ['?amount=abc', 'an amount with no digits'],
    ['', 'no parameters at all'],
    ['?', 'an empty query'],
    ['?unrelated=1', 'unrelated parameters'],
  ])('ignores %s (%s)', (search) => {
    expect(parseShareParams(search)).toEqual({});
  });

  it('sanitises the amount exactly as the input field would', () => {
    // A link can never introduce text the amount field would have refused.
    expect(parseShareParams('?amount=1.890,50').amount).toBe('1.890,50');
    expect(parseShareParams('?amount=฿1890').amount).toBe('1890');
  });

  it('accepts a machine-written decimal as readily as a typed one', () => {
    expect(parseShareParams('?amount=1890.5').amount).toBe('1890.5');
  });
});

describe('buildShareQuery', () => {
  it('names its parameters so a human can read the link', () => {
    expect(buildShareQuery({ country: 'TH', to: 'EUR', amount: '1890' })).toBe(
      'country=TH&to=EUR&amount=1890',
    );
  });

  it('leaves out an empty amount rather than writing ?amount=', () => {
    expect(buildShareQuery({ country: 'TH', to: 'EUR', amount: '' })).toBe('country=TH&to=EUR');
    expect(buildShareQuery({ country: 'TH', to: 'EUR', amount: '   ' })).toBe('country=TH&to=EUR');
  });

  it('round-trips through the parser', () => {
    const state = { country: 'VN', to: 'ARS', amount: '999.999' } as const;
    expect(parseShareParams(`?${buildShareQuery(state)}`)).toEqual(state);
  });
});

describe('buildShareUrl', () => {
  it('uses the origin it is given rather than guessing one', () => {
    expect(
      buildShareUrl('https://pricelens.app', { country: 'TH', to: 'EUR', amount: '1890' }),
    ).toBe('https://pricelens.app/?country=TH&to=EUR&amount=1890');
  });
});
