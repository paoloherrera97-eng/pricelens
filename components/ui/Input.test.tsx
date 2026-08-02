import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { IconButton } from './IconButton';
import { Input } from './Input';

describe('Input', () => {
  it('associates its label with the field', () => {
    render(<Input label="Importe" />);
    expect(screen.getByLabelText('Importe')).toBeInTheDocument();
  });

  it('keeps the label available to assistive tech when visually hidden', () => {
    // A placeholder is not a label: it disappears the moment the user types.
    render(<Input label="Importe" isLabelHidden placeholder="0" />);
    expect(screen.getByLabelText('Importe')).toBeInTheDocument();
  });

  it('generates unique ids so two inputs on one screen never collide', () => {
    render(
      <>
        <Input label="Moneda local" />
        <Input label="Tu moneda" />
      </>,
    );
    const first = screen.getByLabelText('Moneda local');
    const second = screen.getByLabelText('Tu moneda');
    expect(first.id).not.toBe(second.id);
  });

  it('wires a hint up via aria-describedby', () => {
    render(<Input label="Importe" hint="Usa punto o coma" />);
    const input = screen.getByLabelText('Importe');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('Usa punto o coma');
  });

  it('sets no aria-describedby when there is no hint', () => {
    render(<Input label="Importe" />);
    expect(screen.getByLabelText('Importe')).not.toHaveAttribute('aria-describedby');
  });

  it('accepts typing and forwards the value', async () => {
    const user = userEvent.setup();
    render(<Input label="Importe" />);
    const input = screen.getByLabelText('Importe');
    await user.type(input, '1890');
    expect(input).toHaveValue('1890');
  });

  /**
   * The seam that makes camera capture a drop-in rather than a redesign
   * (ADR-012). If this breaks, the OCR readiness claim is no longer true.
   */
  it('renders an interactive trailing action that is separately reachable', async () => {
    const user = userEvent.setup();
    render(
      <Input
        label="Importe"
        trailing={
          <IconButton label="Escanear precio">
            <svg />
          </IconButton>
        }
      />,
    );

    const input = screen.getByLabelText('Importe');
    const action = screen.getByRole('button', { name: 'Escanear precio' });
    expect(action).toBeInTheDocument();

    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    expect(action).toHaveFocus();
  });

  it('renders a decorative leading adornment hidden from assistive tech', () => {
    render(<Input label="Importe" leading="฿" />);
    expect(screen.getByText('฿')).toHaveAttribute('aria-hidden', 'true');
  });
});
