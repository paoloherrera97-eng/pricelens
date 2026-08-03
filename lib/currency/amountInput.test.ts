import { describe, expect, it } from 'vitest';

import { parseAmount } from './parse';
import {
  amountSeparators,
  formatAmountInput,
  formatAmountValue,
  nextAmountEdit,
} from './amountInput';

const ES = 'es-ES';
const SEP = amountSeparators(ES);

/** Types `keys` one character at a time, as a person would. */
function type(keys: string, start = ''): { text: string; caret: number } {
  let text = start;
  let caret = start.length;
  for (const key of keys) {
    const input = text.slice(0, caret) + key + text.slice(caret);
    ({ text, caret } = nextAmountEdit(text, input, caret + 1, ES, SEP));
  }
  return { text, caret };
}

/** Presses backspace once at `caret`. */
function backspace(text: string, caret = text.length) {
  const input = text.slice(0, caret - 1) + text.slice(caret);
  return nextAmountEdit(text, input, caret - 1, ES, SEP);
}

describe('amountSeparators', () => {
  it.each([
    ['es-ES', '.', ','],
    ['en-US', ',', '.'],
    ['de-DE', '.', ','],
  ])('reads %s from Intl rather than assuming', (locale, group, decimal) => {
    expect(amountSeparators(locale)).toEqual({ group, decimal });
  });

  it('handles a locale that groups with a space', () => {
    // French uses a narrow no-break space; hardcoding `.` and `,` breaks it.
    expect(amountSeparators('fr-FR').decimal).toBe(',');
    expect(amountSeparators('fr-FR').group).not.toBe('.');
  });
});

describe('formatAmountInput', () => {
  it.each([
    ['1', '1'],
    ['10', '10'],
    ['100', '100'],
    ['1000', '1.000'],
    ['10000', '10.000'],
    ['100000', '100.000'],
    ['1000000', '1.000.000'],
  ])('groups %s as %s', (raw, expected) => {
    // Spanish CLDR would render 1000 as "1000" by default — a field that shows
    // "1000" then "10.000" looks broken while you type through it.
    expect(formatAmountInput(raw, ES, SEP)).toBe(expected);
  });

  it('keeps decimals as typed', () => {
    expect(formatAmountInput('12345,50', ES, SEP)).toBe('12.345,50');
  });

  it.each([
    ['12,', '12,', 'a trailing separator mid-typing'],
    ['12,50', '12,50', 'trailing zeros'],
    ['12,500', '12,500', 'more precision than the currency has'],
  ])('preserves %s (%s)', (raw, expected) => {
    // Running the fraction through Intl would collapse "12,50" to "12,5" while
    // the user is still typing it.
    expect(formatAmountInput(raw, ES, SEP)).toBe(expected);
  });

  it.each([
    ['1.234,56', '1.234,56', 'Spanish'],
    ['1,234.56', '1.234,56', 'English'],
  ])('re-formats %s pasted in %s form', (pasted, expected) => {
    // Both separators present means a formatted number: the rightmost one is
    // the decimal, whichever locale wrote it.
    expect(formatAmountInput(pasted, ES, SEP)).toBe(expected);
  });

  it.each([
    ['', ''],
    ['abc', ''],
    [',', '0,'],
    ['.', ''],
  ])('renders %o as %o', (raw, expected) => {
    expect(formatAmountInput(raw, ES, SEP)).toBe(expected);
  });

  it('survives a number larger than Number.MAX_SAFE_INTEGER', () => {
    expect(formatAmountInput('9007199254740993000', ES, SEP)).toBe('9.007.199.254.740.993.000');
  });
});

describe('formatAmountValue', () => {
  it.each([
    ['1890', '1.890', 'a plain integer'],
    ['1.890', '1.890', 'a link the app wrote'],
    ['1890.5', '1.890,5', 'a hand-written English decimal'],
    ['1890,5', '1.890,5', 'a hand-written Spanish decimal'],
    ['1,234.56', '1.234,56', 'a pasted English number'],
    ['1.234,56', '1.234,56', 'a pasted Spanish number'],
    ['12,50', '12,50', 'a price whose trailing zero is the point'],
    ['', '', 'an absent amount'],
  ])('reads %o as %o (%s)', (raw, expected, _reason) => {
    // Links are readable on purpose, so people hand-write them. An external
    // value is interpreted by `parseAmount` — the same reading the conversion
    // uses — rather than by the typing rules, which assume the field itself
    // inserted every grouping character.
    expect(formatAmountValue(raw, ES, SEP)).toBe(expected);
  });

  it('round-trips whatever the field is holding', () => {
    for (const keys of ['1000000', '12345,50', '0,5', '7']) {
      const shown = type(keys).text;
      expect(formatAmountValue(shown, ES, SEP)).toBe(shown);
    }
  });

  it('agrees with parseAmount, which is what the conversion reads', () => {
    for (const raw of ['1890', '1890.5', '1.234,56', '1,234.56']) {
      expect(parseAmount(formatAmountValue(raw, ES, SEP))).toBe(parseAmount(raw));
    }
  });
});

describe('nextAmountEdit — typing', () => {
  it('shows the requested sequence, digit by digit', () => {
    const seen: string[] = [];
    let text = '';
    let caret = 0;
    for (const key of '1000000') {
      const input = text.slice(0, caret) + key + text.slice(caret);
      ({ text, caret } = nextAmountEdit(text, input, caret + 1, ES, SEP));
      seen.push(text);
    }
    expect(seen).toEqual(['1', '10', '100', '1.000', '10.000', '100.000', '1.000.000']);
  });

  it('leaves the caret at the end while typing', () => {
    const { text, caret } = type('1000000');
    expect(caret).toBe(text.length);
  });

  it('types decimals', () => {
    expect(type('12345,50').text).toBe('12.345,50');
  });

  it('ignores the grouping character, because the field supplies it', () => {
    // In Spanish `.` groups. There is no ambiguity left for it to express.
    expect(type('1.000').text).toBe('1.000');
  });

  it('keeps a digit typed in the middle in the middle', () => {
    // "1.234" with the caret after "2" — typing 9 gives 12.934, and the caret
    // must sit after the 9, not jump to the end.
    const start = '1.234';
    const caret = 3; // 1 . 2 | 3 4
    const input = start.slice(0, caret) + '9' + start.slice(caret);
    const result = nextAmountEdit(start, input, caret + 1, ES, SEP);

    expect(result.text).toBe('12.934');
    expect(result.text.slice(0, result.caret)).toBe('12.9');
  });

  it('does not let a second decimal separator through', () => {
    expect(type('12,,5').text).toBe('12,5');
  });
});

describe('nextAmountEdit — deleting', () => {
  it('deletes a digit and regroups', () => {
    expect(backspace('10.000').text).toBe('1.000');
  });

  it('deletes the digit in front of a grouping separator', () => {
    // Backspacing onto "." would otherwise do nothing visible: the separator
    // comes straight back and the caret has not moved. Removing the "1" leaves
    // "000", which a money field shows as "0" — leading zeros are not a number.
    const result = backspace('1.000', 2); // caret between "." and "0"
    expect(result.text).toBe('0');
  });

  it('drops leading zeros rather than showing them', () => {
    expect(type('007').text).toBe('7');
    expect(type('0,5').text).toBe('0,5');
  });

  it('empties the field completely', () => {
    let state = { text: '1.000.000', caret: 9 };
    for (let i = 0; i < 7; i++) state = backspace(state.text, state.caret);
    expect(state.text).toBe('');
  });

  it('keeps the caret where the deletion happened', () => {
    // "12.345" with caret after "3": deleting gives 1.245, caret after "2".
    const result = backspace('12.345', 4);
    expect(result.text).toBe('1.245');
    expect(result.text.slice(0, result.caret)).toBe('1.2');
  });
});

describe('nextAmountEdit — pasting', () => {
  it.each([
    ['1234567', '1.234.567'],
    ['1.234.567', '1.234.567'],
    ['1,234,567.89', '1.234.567,89'],
    ['1 234 567', '1.234.567'],
  ])('normalises a pasted %s to %s', (pasted, expected) => {
    const result = nextAmountEdit('', pasted, pasted.length, ES, SEP);
    expect(result.text).toBe(expected);
    expect(result.caret).toBe(result.text.length);
  });
});

describe('the formatted text still parses to the right number', () => {
  it.each([
    ['1000', 1000],
    ['10000', 10000],
    ['100000', 100000],
    ['1000000', 1000000],
    ['12345,50', 12345.5],
    ['1234567,89', 1234567.89],
    ['0,5', 0.5],
    ['999999999', 999999999],
  ])('%s typed → %d', (keys, expected) => {
    // The contract that keeps the conversion engine untouched: whatever the
    // field displays, `parseAmount` still yields the clean number.
    expect(parseAmount(type(keys).text)).toBe(expected);
  });

  it('parses an empty field as zero, not as an error', () => {
    expect(parseAmount('')).toBe(0);
  });
});
