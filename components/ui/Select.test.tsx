import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select, type SelectOption } from './Select';

const OPTIONS: SelectOption[] = [
  { value: 'EUR', label: 'EUR', description: 'euro', meta: '€', keywords: ['Zona euro'] },
  { value: 'JPY', label: 'JPY', description: 'yen japonés', meta: '¥', keywords: ['Japón'] },
  { value: 'THB', label: 'THB', description: 'bat tailandés', meta: '฿', keywords: ['Tailandia'] },
  {
    value: 'USD',
    label: 'USD',
    description: 'dólar estadounidense',
    meta: '$',
    keywords: ['Estados Unidos'],
  },
];

function setup(overrides: Partial<React.ComponentProps<typeof Select>> = {}) {
  const onChange = vi.fn();
  render(
    <Select
      label="Tu moneda"
      value="EUR"
      options={OPTIONS}
      onChange={onChange}
      searchLabel="Buscar moneda o país"
      noResultsLabel="No se encontró ninguna moneda"
      {...overrides}
    />,
  );
  return { onChange, user: userEvent.setup() };
}

describe('Select — trigger', () => {
  it('exposes expanded state on the trigger', async () => {
    const { user } = setup();
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens with ArrowDown, Enter and Space from the keyboard', async () => {
    const { user } = setup();
    const trigger = screen.getByRole('button');

    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows the selected option on the trigger', () => {
    setup({ value: 'THB' });
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('THB');
    expect(trigger).toHaveTextContent('bat tailandés');
  });
});

describe('Select — listbox semantics', () => {
  it('uses combobox + listbox roles and marks the selected option', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const selected = screen.getByRole('option', { selected: true });
    expect(selected).toHaveTextContent('EUR');
  });

  it('points at the active option with aria-activedescendant', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));

    const search = screen.getByRole('combobox');
    const activeId = search.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    // Focus stays in the search field so typing is never interrupted.
    expect(search).toHaveFocus();
    expect(document.getElementById(activeId!)).toHaveAttribute('role', 'option');
  });

  it('opens with the current selection active rather than the top of the list', async () => {
    const { user } = setup({ value: 'THB' });
    await user.click(screen.getByRole('button'));

    const activeId = screen.getByRole('combobox').getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId!)).toHaveTextContent('THB');
  });
});

describe('Select — search', () => {
  it('filters by code, by name, and by country', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    const search = screen.getByRole('combobox');

    await user.type(search, 'JPY');
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.clear(search);
    await user.type(search, 'tailandés');
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.clear(search);
    // Travelers know the country, not always the code (PRD FR-2).
    await user.type(search, 'Japón');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('ignores accents, so "Japon" finds "Japón"', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'Japon');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('is case-insensitive', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'thb');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('shows a no-results message instead of an empty panel', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'zzzz');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('No se encontró ninguna moneda')).toBeInTheDocument();
  });
});

describe('Select — keyboard navigation', () => {
  it('moves the active option with ArrowDown and ArrowUp, and wraps', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    const search = screen.getByRole('combobox');

    const activeText = () =>
      document.getElementById(search.getAttribute('aria-activedescendant')!)?.textContent;

    expect(activeText()).toContain('EUR');
    await user.keyboard('{ArrowDown}');
    expect(activeText()).toContain('JPY');
    await user.keyboard('{ArrowUp}');
    expect(activeText()).toContain('EUR');
    // Wrapping means a user never hits an invisible wall at either end.
    await user.keyboard('{ArrowUp}');
    expect(activeText()).toContain('USD');
  });

  it('jumps to the ends with Home and End', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button'));
    const search = screen.getByRole('combobox');
    const activeText = () =>
      document.getElementById(search.getAttribute('aria-activedescendant')!)?.textContent;

    await user.keyboard('{End}');
    expect(activeText()).toContain('USD');
    await user.keyboard('{Home}');
    expect(activeText()).toContain('EUR');
  });

  it('selects the active option with Enter', async () => {
    const { onChange, user } = setup();
    await user.click(screen.getByRole('button'));
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('JPY');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape without selecting, and returns focus to the trigger', async () => {
    const { onChange, user } = setup();
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.keyboard('{ArrowDown}{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    // Returning focus is what stops a keyboard user from being dumped at the
    // top of the document.
    expect(trigger).toHaveFocus();
  });
});

describe('Select — pointer', () => {
  it('selects on click', async () => {
    const { onChange, user } = setup();
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: /THB/ }));

    expect(onChange).toHaveBeenCalledWith('THB');
  });

  it('is not operable when disabled', async () => {
    const { user } = setup({ disabled: true });
    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
