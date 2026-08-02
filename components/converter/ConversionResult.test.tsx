import { describe, expect, it } from 'vitest';

import { render, screen } from '@/tests/render';

import { ConversionResult } from './ConversionResult';

/**
 * jsdom has no layout engine and applies no CSS, so nothing here can prove the
 * value *fits* — that is measured against a real browser at several viewport
 * widths. What these tests do guard is the wiring the CSS depends on: the
 * sizing formula in `app/globals.css` reads `--len`, and it is silently inert
 * if the component stops setting it or stops carrying the utility class.
 */
describe('ConversionResult', () => {
  const base = {
    original: '43.863,13 €',
    converted: '48.154.088,37 ARS',
    rateLine: '1 EUR = 1097,83 ARS',
    isLoading: false,
  };

  it('publishes the value length as --len for the sizing formula', () => {
    render(<ConversionResult {...base} />);

    const value = screen.getByText(base.converted);

    expect(value.style.getPropertyValue('--len')).toBe(String(base.converted.length));
  });

  it('keeps --len in step with the value it is sizing', () => {
    const { rerender } = render(<ConversionResult {...base} />);
    rerender(<ConversionResult {...base} converted="49,12 €" />);

    expect(screen.getByText('49,12 €').style.getPropertyValue('--len')).toBe('7');
  });

  it('carries the fit utilities that consume --len', () => {
    render(<ConversionResult {...base} />);

    const value = screen.getByText(base.converted);

    // Regression guard: these are font sizes that look like colours to
    // tailwind-merge, and `text-fg` sits alongside them (see lib/utils/cn.ts).
    expect(value).toHaveClass('text-fit');
    expect(value).toHaveClass('sm:text-fit-lg');
    expect(value).toHaveClass('text-fg');
  });

  it('still announces the conversion for screen readers', () => {
    render(<ConversionResult {...base} />);

    expect(screen.getByText(`${base.original} equivale a ${base.converted}`)).toBeInTheDocument();
  });

  it('says nothing at all before an amount is entered', () => {
    // The visible "0,00 €" is a placeholder holding the card's height open.
    // Announcing it tells a screen-reader user that a conversion happened.
    render(<ConversionResult {...base} original="0,00 ฿" converted="0,00 €" isEmpty />);

    expect(screen.getByText('0,00 €')).toBeInTheDocument();
    expect(screen.queryByText(/equivale a/)).not.toBeInTheDocument();
  });
});
