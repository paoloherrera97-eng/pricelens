import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { APP_CONFIG } from '@/config';
import { render, screen, waitFor } from '@/tests/render';

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

    // Home is EUR by default; visiting a euro country would otherwise produce a
    // 1:1 dead end, so the home currency moves aside.
    await user.click(await screen.findByRole('button', { name: /país viajas/ }));
    await user.type(screen.getByRole('combobox'), 'España');
    await user.click(screen.getByRole('option', { name: /España/ }));

    expect(screen.getByRole('button', { name: /Tu moneda/ })).toHaveTextContent('USD');
  });
});

describe('Converter — country-first selection (ADR-014)', () => {
  it('asks which country the traveler is visiting', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);
    expect(await screen.findByRole('button', { name: /país viajas/ })).toBeInTheDocument();
  });

  it('derives the currency from the chosen country', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: /país viajas/ }));
    await user.type(screen.getByRole('combobox'), 'Tailandia');
    await user.click(screen.getByRole('option', { name: /Tailandia/ }));

    // The traveler picked a country; the app worked out THB.
    await waitFor(() => expect(screen.getByText(/1 THB =/)).toBeInTheDocument());
  });

  it('searches countries by name, and by currency code for those who know it', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: /país viajas/ }));
    const search = screen.getByRole('combobox');

    await user.type(search, 'Japon');
    expect(screen.getByRole('option', { name: /Japón/ })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'JPY');
    expect(screen.getByRole('option', { name: /Japón/ })).toBeInTheDocument();
  });

  it('moves the country selector to match after a swap', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: /país viajas/ }));
    await user.type(screen.getByRole('combobox'), 'Tailandia');
    await user.click(screen.getByRole('option', { name: /Tailandia/ }));

    await user.click(screen.getByRole('button', { name: 'Intercambiar monedas' }));

    // THB→EUR becomes EUR→THB: the country side must now show a euro country.
    await waitFor(() => expect(screen.getByText(/1 EUR =/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Tu moneda/ })).toHaveTextContent('THB');
  });
});

describe('Converter — paste', () => {
  it('accepts a pasted price with symbol and separators', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    await user.click(input);
    await user.paste('฿1.890');

    // The symbol is dropped, the value survives — no paste handler required.
    // The symbol is dropped and "1.890" reads as 1890 in the Spanish locale.
    expect(input).toHaveValue('1.890');
    await waitFor(async () => expect(await resultText()).toMatch(/1738,80/));
  });
});

describe('Converter — loading', () => {
  it('shows a skeleton shaped like the real layout, not a spinner', async () => {
    // Never resolves: holds the loading state open.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<Converter />);

    const busy = await screen.findByLabelText('Cargando tasas');
    expect(busy).toHaveAttribute('aria-busy', 'true');
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
    expect(screen.getByRole('button', { name: /país viajas/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tu moneda/ })).toBeInTheDocument();
  });
});

describe('Converter — home currency detection', () => {
  /**
   * jsdom reports `en-US` and whatever timezone the runner is in, so these
   * stub `navigator.language` rather than relying on the environment — a test
   * that passes only on a machine set to Argentina is not a test.
   */
  function withLocale(locale: string) {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(locale);
  }

  it('adopts the currency of the device region on a first visit', async () => {
    mockRates({ ...SNAPSHOT, rates: { ...SNAPSHOT.rates, GBP: 0.79 } });
    withLocale('en-GB');
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(/1 USD = /)).toHaveTextContent('GBP'));
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.homeCurrency)).toBe('GBP');
  });

  it('leaves a returning visitor’s stored choice alone', async () => {
    // The failure mode that makes this kind of feature hated: re-detecting on
    // every visit and overriding what the user deliberately picked.
    window.localStorage.setItem(APP_CONFIG.storageKeys.homeCurrency, 'JPY');
    mockRates(SNAPSHOT);
    withLocale('en-GB');
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(/1 USD =/)).toBeInTheDocument());

    expect(screen.getByText(/1 USD =/)).toHaveTextContent('JPY');
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.homeCurrency)).toBe('JPY');
  });

  it('keeps the configured default when the region names no currency we carry', async () => {
    mockRates(SNAPSHOT);
    withLocale('en');
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(/1 USD =/)).toBeInTheDocument());
    expect(screen.getByText(/1 USD =/)).toHaveTextContent(APP_CONFIG.defaultHomeCurrency);
  });

  it('moves the destination when the detected currency is the one being converted from', async () => {
    // Detecting USD for a US visitor would otherwise leave USD → USD, a 1:1
    // dead end (PRD E8). Routing through the picker's own handler avoids it.
    mockRates(SNAPSHOT);
    withLocale('en-US');
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /país viajas/ })).not.toHaveTextContent(
        'Estados Unidos',
      ),
    );
    expect(screen.getByText(/= 1 USD|1 EUR =/)).toBeInTheDocument();
  });
});

describe('Converter — favourites', () => {
  const FAVOURITES_KEY = APP_CONFIG.storageKeys.favourites;

  async function ready() {
    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(/1 USD =/)).toBeInTheDocument());
  }

  function star() {
    return screen.getByRole('button', { name: /favorito/i });
  }

  it('saves the pair on screen and marks the star as pressed', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    expect(star()).toHaveAttribute('aria-pressed', 'false');
    await user.click(star());

    expect(star()).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(window.localStorage.getItem(FAVOURITES_KEY)!)).toEqual([
      { country: 'US', to: 'EUR' },
    ]);
  });

  it('takes the pair back on a second tap', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    await user.click(star());
    await user.click(star());

    expect(star()).toHaveAttribute('aria-pressed', 'false');
    expect(JSON.parse(window.localStorage.getItem(FAVOURITES_KEY)!)).toEqual([]);
  });

  it('shows nothing at all until something is saved', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);
    await ready();

    // An empty-state prompt would be teaching a feature at the moment the user
    // is trying to read a price.
    expect(screen.queryByText('Favoritos')).not.toBeInTheDocument();
  });

  it('restores both selectors when a saved pair is chosen', async () => {
    window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify([{ country: 'TH', to: 'JPY' }]));
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    await user.click(screen.getByRole('button', { name: /Tailandia, de THB a JPY/ }));

    await waitFor(() => expect(screen.getByText(/1 THB =/)).toHaveTextContent('JPY'));
    expect(screen.getByRole('button', { name: /país viajas/ })).toHaveTextContent('Tailandia');
  });

  it('does not save the same pair twice', async () => {
    window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify([{ country: 'US', to: 'EUR' }]));
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    // Already saved, so the star is pressed and tapping it removes rather than
    // duplicating. The list can never grow by re-saving what is on screen.
    expect(star()).toHaveAttribute('aria-pressed', 'true');
    await user.click(star());
    expect(JSON.parse(window.localStorage.getItem(FAVOURITES_KEY)!)).toHaveLength(0);
  });

  it('survives a corrupt stored value instead of failing to render', async () => {
    window.localStorage.setItem(FAVOURITES_KEY, '{not json');
    mockRates(SNAPSHOT);
    render(<Converter />);

    await ready();
    expect(screen.queryByText('Favoritos')).not.toBeInTheDocument();
  });

  it('leaves the conversion untouched when a favourite is saved', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    await user.type(screen.getByLabelText('Importe'), '100');
    const before = await resultText();
    await user.click(star());

    expect(await resultText()).toBe(before);
  });
});
