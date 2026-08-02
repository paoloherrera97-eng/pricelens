import { describe, expect, it } from 'vitest';

import { cn } from './cn';

/**
 * These assertions exist because of a real bug: `text-display-sm` was classified
 * as a *colour* by tailwind-merge, so putting it next to `text-fg` dropped it
 * and the conversion result rendered at the inherited 16px instead of 48px for
 * three phases. jsdom applies no CSS, so no component test could see it — the
 * only thing that can catch it is asserting on the merged class string itself.
 *
 * Every custom `--text-*` token needs a case here.
 */
describe('cn', () => {
  it.each(['text-display', 'text-display-sm', 'text-fit', 'text-fit-lg'])(
    'keeps %s when a text colour is applied alongside it',
    (size) => {
      const result = cn(size, 'text-fg');

      expect(result).toContain(size);
      expect(result).toContain('text-fg');
    },
  );

  it('still lets a later font size win over an earlier one', () => {
    expect(cn('text-fit', 'text-display')).toBe('text-display');
  });

  it('still lets a later text colour win over an earlier one', () => {
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted');
  });

  it('resolves ordinary conflicting utilities to the last one written', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
