/**
 * Turning what a traveler types into a number.
 *
 * Pure: no DOM, no locale detection, no side effects.
 */

/**
 * Strips everything that cannot belong in an amount.
 *
 * Used by the controlled input so invalid characters never appear at all.
 * Rejecting a keystroke silently is kinder than showing an error for something
 * we could simply ignore (PRD FR-1).
 */
export function sanitizeAmountInput(raw: string): string {
  return raw.replace(/[^\d.,\s]/g, '');
}

/**
 * Decides whether a lone separator is grouping a thousand rather than marking a
 * decimal.
 *
 * The genuinely ambiguous case is a single separator, and the shipping locale
 * settles it: in Spanish, `.` groups thousands and `,` marks decimals, so
 * `1.890` is one thousand eight hundred ninety — not 1.89. A traveler pasting a
 * price from a Spanish page means the former, and the earlier locale-agnostic
 * rule got it exactly backwards.
 *
 * Grouping requires *exactly* three following digits and a plausible leading
 * group, so `12,50` and `0.500` stay decimals — nobody writes zero thousands.
 */
function isGroupingPair(head: string, tail: string): boolean {
  if (tail.length !== 3) return false;
  if (head.length === 0 || head.length > 3) return false;
  return !head.startsWith('0');
}

/**
 * Parses a user-typed amount.
 *
 * Handles both decimal conventions, because a European traveler types `12,50`
 * and an American types `12.50`:
 *
 *   "12.50"      → 12.5
 *   "12,50"      → 12.5
 *   "1.234,56"   → 1234.56   (rightmost separator wins)
 *   "1,234.56"   → 1234.56
 *   "1 890"      → 1890      (thin spaces from some keyboards)
 *   "1.234.567"  → 1234567   (repeated separator ⇒ grouping)
 *   "1.890"      → 1890      (lone separator + 3 digits ⇒ grouping)
 *   "0.500"      → 0.5       (…but nobody writes zero thousands)
 *
 * Returns `null` for input that is not a number, and `0` for empty input —
 * empty is a valid, neutral state rather than an error (PRD E1).
 */
export function parseAmount(input: string): number | null {
  const trimmed = input.replace(/\s/g, '');
  if (trimmed === '') return 0;
  if (!/^[\d.,]+$/.test(trimmed)) return null;

  const lastDot = trimmed.lastIndexOf('.');
  const lastComma = trimmed.lastIndexOf(',');

  let normalised: string;

  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: the rightmost is the decimal separator, the other groups.
    const decimalAt = Math.max(lastDot, lastComma);
    const groupChar = decimalAt === lastDot ? ',' : '.';
    normalised =
      trimmed.slice(0, decimalAt).split(groupChar).join('') + '.' + trimmed.slice(decimalAt + 1);
  } else {
    const sep = lastDot !== -1 ? '.' : lastComma !== -1 ? ',' : null;
    if (sep === null) {
      normalised = trimmed;
    } else {
      const parts = trimmed.split(sep);
      if (parts.length > 2) {
        // Repeated separator can only be grouping: "1.234.567".
        normalised = parts.join('');
      } else {
        normalised = isGroupingPair(parts[0] ?? '', parts[1] ?? '')
          ? parts.join('')
          : parts.join('.');
      }
    }
  }

  // A bare separator, or one with nothing after it, is mid-typing rather than
  // invalid — treat "12." as 12 so the result does not blink out.
  if (normalised.endsWith('.')) normalised = normalised.slice(0, -1);
  if (normalised === '' || normalised === '.') return 0;

  const value = Number(normalised);
  return Number.isFinite(value) ? value : null;
}
