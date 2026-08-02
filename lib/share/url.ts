/**
 * The conversion, expressed as a URL.
 *
 * Three parameters, named for what they are rather than shortened: a shared
 * link gets read by people, and `?country=TH&to=EUR&amount=1.890` says what it
 * does where `?c=TH&t=EUR&a=1890` needs a decoder ring.
 *
 * The amount travels as the **text the sender typed**, not as a normalised
 * number. Converting it would mean choosing a format, and the recipient would
 * see something the sender never wrote; passing it through means the link shows
 * their own price back to them. It is sanitised on the way in and on the way
 * out, so a hand-written `?amount=1890.5` works just as well.
 */

import { getCountry, isCurrencyCode, type CurrencyCode } from '@/config';
import { sanitizeAmountInput } from '@/lib/currency/parse';

export const SHARE_PARAMS = {
  country: 'country',
  to: 'to',
  amount: 'amount',
} as const;

export interface ShareState {
  /** ISO 3166-1 alpha-2 of the country being visited. */
  readonly country: string;
  readonly to: CurrencyCode;
  /** Raw input text, exactly as the amount field holds it. */
  readonly amount: string;
}

/** The parts of a shared link that were present *and* valid. */
export type PartialShareState = Partial<ShareState>;

/**
 * Reads share parameters from a query string.
 *
 * Every field is validated independently and a bad one is dropped rather than
 * failing the whole link: a URL that has been truncated by a chat client should
 * still restore what survived. A link is untrusted input — it arrives from
 * wherever the sender pasted it.
 */
export function parseShareParams(search: string): PartialShareState {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return {};
  }

  const state: { -readonly [K in keyof ShareState]?: ShareState[K] } = {};

  const country = params.get(SHARE_PARAMS.country)?.toUpperCase();
  if (country && getCountry(country)) state.country = country;

  const to = params.get(SHARE_PARAMS.to)?.toUpperCase();
  if (to && isCurrencyCode(to)) state.to = to;

  const amount = params.get(SHARE_PARAMS.amount);
  if (amount !== null) {
    // The same sanitiser the input uses, so a link can never introduce text the
    // field would have refused.
    const sanitised = sanitizeAmountInput(amount);
    if (sanitised) state.amount = sanitised;
  }

  return state;
}

/** The query string for a conversion, with empty amounts left out. */
export function buildShareQuery(state: ShareState): string {
  const params = new URLSearchParams();
  params.set(SHARE_PARAMS.country, state.country);
  params.set(SHARE_PARAMS.to, state.to);
  // An empty amount is the resting state, and `?amount=` in a shared link is
  // noise that says nothing.
  if (state.amount.trim()) params.set(SHARE_PARAMS.amount, state.amount);

  return params.toString();
}

/** The absolute link to share. `origin` comes from the browser, never guessed. */
export function buildShareUrl(origin: string, state: ShareState): string {
  return `${origin}/?${buildShareQuery(state)}`;
}
