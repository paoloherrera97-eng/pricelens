import { describe, expect, it } from 'vitest';

import { render, screen } from '@/tests/render';

import { ConverterSkeleton } from './ConverterSkeleton';

/**
 * The loading state carried `aria-label` on a plain `div`, which is prohibited
 * ARIA — so it had no accessible name at all and was announced to nobody. axe
 * reported it as `aria-prohibited-attr` (serious); no component test could,
 * because the markup was otherwise valid.
 */
describe('ConverterSkeleton', () => {
  it('exposes the loading state as a named status region', () => {
    render(<ConverterSkeleton label="Cargando tasas" />);

    const status = screen.getByRole('status', { name: 'Cargando tasas' });

    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
  });
});
