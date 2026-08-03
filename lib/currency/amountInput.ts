/**
 * Live formatting for the amount field.
 *
 * Pure: no DOM, no React, no locale detection. The caller owns the input
 * element and this module owns the decision about what the field should read
 * and where the caret belongs afterwards.
 *
 * Nothing here converts anything. `parseAmount` still turns the field's text
 * into the number every conversion uses, exactly as before — grouping
 * separators are something it already understands.
 */

import { normaliseAmount } from './parse';

/** The two characters a locale uses inside a number. */
export interface AmountSeparators {
  /** Between thousands: `.` in Spanish, `,` in English, U+202F in French. */
  readonly group: string;
  /** Before the fractional part: `,` in Spanish, `.` in English. */
  readonly decimal: string;
}

/**
 * Asks `Intl` what the locale's separators are, rather than assuming.
 *
 * `formatToParts` is the only honest way to get these: hardcoding `.` and `,`
 * breaks on French, which groups with a narrow no-break space.
 */
export function amountSeparators(locale: string): AmountSeparators {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  };
}

/**
 * Groups an integer's digits.
 *
 * `useGrouping: 'always'` is load-bearing, not decoration. Spanish and German
 * follow CLDR's `minimumGroupingDigits: 2`, so the default formatter renders
 * 1000 as `1000` and only starts grouping at five digits — measured, not
 * assumed. A field that shows `1000` and then `10.000` looks broken while you
 * type through it.
 */
function groupDigits(digits: string, locale: string): string {
  if (digits === '') return '';

  // Formatting the digits as a number would lose leading zeros and overflow
  // past Number.MAX_SAFE_INTEGER, so BigInt carries them intact.
  try {
    return new Intl.NumberFormat(locale, {
      useGrouping: 'always',
      maximumFractionDigits: 0,
    }).format(BigInt(digits));
  } catch {
    // Unparseable as an integer — hand it back rather than losing the input.
    return digits;
  }
}

interface Split {
  /** Integer digits, no separators. */
  readonly integer: string;
  /** Fractional digits as typed, or null when no decimal separator is present. */
  readonly fraction: string | null;
}

/**
 * Works out what the user meant by the string now in the field.
 *
 * Two cases, and the distinction matters:
 *
 * - **Both separator characters present.** This is a number pasted in some
 *   locale's format, so the rightmost separator is the decimal one and the
 *   other groups — the same rule `parseAmount` uses. `1.234,56` and `1,234.56`
 *   both mean the same amount.
 * - **Only one kind present.** The field inserts grouping itself, so any group
 *   separator in the string is *ours* and gets stripped. What is left can only
 *   be the decimal separator. This is what makes typing work: the field shows
 *   `1.000`, the user types another `0`, and `1.0000` has to become `10.000`
 *   rather than one-and-four-thousandths.
 *
 * The consequence, stated plainly: in Spanish, typing `.` does nothing. It is
 * the grouping character, the field supplies it, and there is no ambiguity left
 * for it to express.
 */
function split(raw: string, separators: AmountSeparators): Split {
  const cleaned = raw.replace(/\s/g, '');
  const hasGroup = cleaned.includes(separators.group);
  const hasDecimal = cleaned.includes(separators.decimal);

  let integerPart: string;
  let fractionPart: string | null;

  if (hasGroup && hasDecimal) {
    const at = Math.max(
      cleaned.lastIndexOf(separators.group),
      cleaned.lastIndexOf(separators.decimal),
    );
    integerPart = cleaned.slice(0, at);
    fractionPart = cleaned.slice(at + 1);
  } else {
    const withoutGroups = cleaned.split(separators.group).join('');
    const at = withoutGroups.indexOf(separators.decimal);
    if (at === -1) {
      integerPart = withoutGroups;
      fractionPart = null;
    } else {
      integerPart = withoutGroups.slice(0, at);
      // A second decimal separator is a slip, not a second decimal point.
      fractionPart = withoutGroups
        .slice(at + 1)
        .split(separators.decimal)
        .join('');
    }
  }

  return {
    integer: integerPart.replace(/\D/g, ''),
    fraction: fractionPart === null ? null : fractionPart.replace(/\D/g, ''),
  };
}

/**
 * The text the field should show for `raw`.
 *
 * The fractional part is re-attached exactly as typed rather than being run
 * through `Intl`, so a trailing separator and trailing zeros survive: `12,`
 * stays `12,` and `12,50` does not collapse to `12,5` while the user is still
 * typing.
 */
export function formatAmountInput(
  raw: string,
  locale: string,
  separators: AmountSeparators = amountSeparators(locale),
): string {
  const { integer, fraction } = split(raw, separators);

  if (integer === '' && (fraction === null || fraction === '')) {
    // Nothing but separators. An empty field shows its placeholder.
    return fraction === null ? '' : `0${separators.decimal}`;
  }

  const grouped = groupDigits(integer === '' ? '0' : integer, locale);
  return fraction === null ? grouped : `${grouped}${separators.decimal}${fraction}`;
}

/**
 * The text the field should show for a value that did **not** come from typing.
 *
 * A shared link is the case that matters. Its `amount` is whatever the sender's
 * field held, and it may equally have been hand-written — the URL is readable on
 * purpose, so `?amount=1890.5` is a thing people do. `formatAmountInput` cannot
 * be used here: it assumes any grouping character is one *it* inserted and
 * strips it, which would turn a hand-written `1890.5` into `18.905`.
 *
 * So an external value goes through `normaliseAmount` — the same reading
 * `parseAmount` gives the conversion, so the link restores the number the sender
 * saw — and only then gets rendered. Interpretation and presentation stay
 * separate, and because normalisation yields text rather than a number, `12,50`
 * keeps its trailing zero instead of coming back as `12,5`.
 */
export function formatAmountValue(
  raw: string,
  locale: string,
  separators: AmountSeparators = amountSeparators(locale),
): string {
  const normalised = normaliseAmount(raw);
  if (!normalised) return '';

  const [integer = '', fraction] = normalised.split('.');
  const grouped = groupDigits(integer === '' ? '0' : integer, locale);
  return fraction === undefined ? grouped : `${grouped}${separators.decimal}${fraction}`;
}

/** Digits before `index`, which is the only position marker that survives reformatting. */
function digitsBefore(text: string, index: number): number {
  let count = 0;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i]! >= '0' && text[i]! <= '9') count++;
  }
  return count;
}

/** The index in `text` just after its `count`-th digit. */
function indexAfterDigits(text: string, count: number): number {
  if (count === 0) return 0;

  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i]! >= '0' && text[i]! <= '9') {
      seen++;
      if (seen === count) return i + 1;
    }
  }
  return text.length;
}

export interface AmountEdit {
  /** What the field should now read. */
  readonly text: string;
  /** Where the caret belongs in `text`. */
  readonly caret: number;
}

/**
 * The field's next state after an edit.
 *
 * The caret is preserved by counting **digits**, not characters: digits are the
 * only thing an edit and its reformatted result agree on, because separators
 * move as the number grows. Counting characters is what makes formatted inputs
 * jump.
 *
 * One special case earns its keep. Backspacing onto a grouping separator would
 * otherwise do nothing visible — the separator is removed, the value is
 * unchanged, and reformatting puts it straight back. Here it deletes the digit
 * in front of it instead, which is what every field that does this well does.
 */
export function nextAmountEdit(
  previous: string,
  input: string,
  caret: number,
  locale: string,
  separators: AmountSeparators = amountSeparators(locale),
): AmountEdit {
  let working = input;
  let workingCaret = caret;

  const deletedOneChar = input.length === previous.length - 1;
  if (deletedOneChar && previous[caret] === separators.group && caret > 0) {
    working = input.slice(0, caret - 1) + input.slice(caret);
    workingCaret = caret - 1;
  }

  const text = formatAmountInput(working, locale, separators);
  const wanted = digitsBefore(working, workingCaret);
  let nextCaret = indexAfterDigits(text, wanted);

  // Having just typed the decimal separator, the caret belongs after it rather
  // than before, so the next digit lands in the fraction.
  if (workingCaret > 0 && working[workingCaret - 1] === separators.decimal) {
    if (text[nextCaret] === separators.decimal) nextCaret += 1;
  }

  return { text, caret: nextCaret };
}
