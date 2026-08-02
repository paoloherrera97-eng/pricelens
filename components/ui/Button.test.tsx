import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { IconButton } from './IconButton';

describe('Button', () => {
  it('is a button that defaults to type="button"', () => {
    // Defaulting to "submit" inside a form is a classic accidental-submit bug.
    render(<Button>Convertir</Button>);
    expect(screen.getByRole('button', { name: 'Convertir' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick when activated by pointer and by keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Convertir</Button>);

    const button = screen.getByRole('button', { name: 'Convertir' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('blocks interaction while loading and announces it as busy', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Convertir
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Convertir' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps its label in the tree while loading, so the name never disappears', () => {
    // The label is only visually hidden — a name that vanishes mid-request
    // leaves a screen-reader user without a control to return to.
    render(<Button isLoading>Convertir</Button>);
    expect(screen.getByRole('button', { name: 'Convertir' })).toBeInTheDocument();
  });

  it('does not fire when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Convertir
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Convertir' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('lets callers override variant classes without conflict', () => {
    // twMerge must drop the variant's background rather than leave both.
    render(<Button className="bg-danger-600">Borrar</Button>);
    const cls = screen.getByRole('button', { name: 'Borrar' }).className;
    expect(cls).toContain('bg-danger-600');
    expect(cls).not.toContain('bg-primary-600');
  });
});

describe('IconButton', () => {
  it('takes its accessible name from the required label', () => {
    render(
      <IconButton label="Intercambiar monedas">
        <svg />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Intercambiar monedas' })).toBeInTheDocument();
  });

  it('hides the icon from assistive tech so the name is not duplicated', () => {
    const { container } = render(
      <IconButton label="Intercambiar monedas">
        <svg data-testid="icon" />
      </IconButton>,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
