import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { APP_CONFIG } from '@/config';
import { render, screen, waitFor, within } from '@/tests/render';

import { Converter } from './Converter';

const SNAPSHOT = {
  base: 'USD',
  rates: { USD: 1, EUR: 0.92, THB: 35, JPY: 150, VND: 25_000 },
  fetchedAt: new Date().toISOString(),
  source: 'exchangerate-api',
  degraded: false,
};

function mockRates(response: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 503,
    json: async () => response,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** The big number, read from the live region. */
async function resultText(): Promise<string> {
  const region = document.querySelector('[aria-live="polite"]')!;
  return region.textContent ?? '';
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Converter — loading and ready', () => {
  it('shows the screen and then a conversion once rates arrive', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);

    expect(await screen.findByLabelText('Importe')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/1 USD =/)).toBeInTheDocument());
  });

  it('fetches the rate table exactly once per session (ADR-001)', async () => {
    const fetchMock = mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await user.type(screen.getByLabelText('Importe'), '1890');

    // Every keystroke is local arithmetic — no request per conversion.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});

describe('Converter — conversion', () => {
  it('updates the result as the amount is typed', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    await user.type(input, '100');

    // 100 USD → EUR at 0.92
    await waitFor(async () => expect(await resultText()).toMatch(/92/));
  });

  it('accepts a comma as the decimal separator (E3)', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    await user.type(input, '12,50');
    // 12.50 USD → 11.50 EUR, not 1250 → 1150.
    await waitFor(async () => expect(await resultText()).toMatch(/11,50/));
  });

  it('silently ignores characters that cannot be part of an amount (FR-1)', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    await user.type(input, '1a2b3');
    expect(input).toHaveValue('123');
  });

  it('shows the effective rate so the working is visible', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);
    expect(await screen.findByText(/1 USD = 0,92 EUR/)).toBeInTheDocument();
  });

  it('shows when the rates were last updated', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);
    expect(await screen.findByText(/Actualizado/)).toBeInTheDocument();
  });
});

describe('Converter — home currency persistence (ADR-005)', () => {
  it('loads the home currency from localStorage on start', async () => {
    window.localStorage.setItem(APP_CONFIG.storageKeys.homeCurrency, 'JPY');
    mockRates(SNAPSHOT);
    render(<Converter />);

    const toPicker = await screen.findByRole('button', { name: /Tu moneda/ });
    expect(toPicker).toHaveTextContent('JPY');
  });

  it('persists the home currency when it changes', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: /Tu moneda/ }));
    await user.click(screen.getByRole('option', { name: /THB/ }));

    await waitFor(() =>
      expect(window.localStorage.getItem(APP_CONFIG.storageKeys.homeCurrency)).toBe('THB'),
    );
  });

  it('ignores a corrupt stored value instead of breaking', async () => {
    // A stale or hand-edited value must not poison the UI (E13).
    window.localStorage.setItem(APP_CONFIG.storageKeys.homeCurrency, 'NOT_A_CURRENCY');
    mockRates(SNAPSHOT);
    render(<Converter />);

    const toPicker = await screen.findByRole('button', { name: /Tu moneda/ });
    expect(toPicker).toHaveTextContent(APP_CONFIG.defaultHomeCurrency);
  });
});

describe('Converter — swap', () => {
  it('reverses the direction in one tap and keeps the amount', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    await user.type(input, '100');

    await user.click(screen.getByRole('button', { name: 'Intercambiar monedas' }));

    expect(input).toHaveValue('100');
    // USD→EUR becomes EUR→USD.
    await waitFor(() => expect(screen.getByText(/1 EUR = 1,08/)).toBeInTheDocument());
  });

  it('swaps rather than allowing the same currency on both sides (E8)', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    // Home is EUR by default; choosing EUR as the foreign currency should swap.
    await user.click(await screen.findByRole('button', { name: /Moneda local/ }));
    await user.click(screen.getByRole('option', { name: /EUR/ }));

    const from = screen.getByRole('button', { name: /Moneda local/ });
    const to = screen.getByRole('button', { name: /Tu moneda/ });
    expect(within(from).getByText('EUR')).toBeInTheDocument();
    expect(to).toHaveTextContent('USD');
  });
});

describe('Converter — failure states', () => {
  it('offers a retry when rates cannot be fetched, and never invents a number', async () => {
    mockRates({ error: 'rates_unavailable' }, false);
    render(<Converter />);

    expect(await screen.findByText('No hemos podido obtener las tasas')).toBeInTheDocument();
    // ADR-013: no fabricated rates behind the error.
    expect(screen.queryByText(/1 USD =/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('recovers when a retry succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => SNAPSHOT });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText(/1 USD = 0,92 EUR/)).toBeInTheDocument();
  });

  it('explains the failure differently when the device is offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    mockRates({}, false);
    render(<Converter />);

    expect(
      await screen.findByText('Conéctate a internet para obtener las tasas más recientes.'),
    ).toBeInTheDocument();
  });

  it('says so plainly when a pair has no rate rather than showing zero (E12)', async () => {
    // A table missing the home currency entirely.
    mockRates({ ...SNAPSHOT, rates: { USD: 1, THB: 35 } });
    render(<Converter />);

    expect(
      await screen.findByText('No tenemos la tasa de esta moneda ahora mismo.'),
    ).toBeInTheDocument();
  });
});

describe('Converter — accessibility', () => {
  it('announces the result politely', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);

    await screen.findByLabelText('Importe');
    const region = document.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('labels every control', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);

    await screen.findByLabelText('Importe');
    expect(screen.getByRole('button', { name: 'Intercambiar monedas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Moneda local/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tu moneda/ })).toBeInTheDocument();
  });
});
