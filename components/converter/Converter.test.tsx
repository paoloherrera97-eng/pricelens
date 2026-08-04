import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { APP_CONFIG } from '@/config';
import { render, screen, waitFor, within } from '@/tests/render';

import { Converter } from './Converter';

/**
 * The rate line, whichever way round it reads.
 *
 * The line is shown in the direction whose figure is at least 1, so which code
 * leads depends on the pair — asserting on a fixed one would test the pair
 * rather than the behaviour. Where the direction itself is the point, the test
 * says so explicitly.
 */
const RATE_LINE = /1 [A-Z]{3} = /;

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

/**
 * The big number, read from the element that renders it.
 *
 * Not from the live region: that carries the settled announcement, which by
 * design lags the visible value while the user is still typing.
 */
async function resultText(): Promise<string> {
  return document.querySelector('.fit-container')?.textContent ?? '';
}

/** What a screen reader is told. */
function announcementText(): string {
  return document.querySelector('[aria-live="polite"]')?.textContent ?? '';
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
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
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
    expect(await screen.findByText(/1 EUR = 1,08696 USD/)).toBeInTheDocument();
  });

  it('anuncia el resultado una sola vez, no una por tecla', async () => {
    // Un lector de pantalla encola cada cambio de una región viva y se
    // interrumpe a sí mismo: cinco dígitos producían cinco fragmentos en vez
    // de una respuesta.
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    const input = await screen.findByLabelText('Importe');
    const seen = new Set<string>();
    for (const key of '12500') {
      await user.type(input, key);
      seen.add(announcementText());
    }
    // Mientras se escribe, la región no va cambiando bajo el lector.
    expect(seen.size).toBeLessThanOrEqual(1);

    // Y cuando se para, dice la frase entera, una vez.
    // (es-ES separa el símbolo con un espacio duro, de ahí el `\s`.)
    await waitFor(() => expect(announcementText()).toMatch(/equivale a/));
    expect(announcementText()).toMatch(/12\.500,00\sUS\$ equivale a 11\.500,00\s€/);
  });

  it('no dice el número dos veces', async () => {
    // El valor visible vivía dentro de la región: se anunciaba primero suelto
    // y otra vez dentro de la frase.
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.type(await screen.findByLabelText('Importe'), '100');
    await waitFor(() => expect(announcementText()).toMatch(/equivale a/));

    expect(document.querySelector('.fit-container p')).toHaveAttribute('aria-hidden', 'true');
    expect(announcementText().match(/92,00/g)).toHaveLength(1);
  });

  it('calla mientras no hay importe', async () => {
    // Anunciar el marcador diría «0,00 US$ equivale a 0,00 €», una conversión
    // que nadie ha pedido.
    mockRates(SNAPSHOT);
    render(<Converter />);
    await screen.findByLabelText('Importe');

    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
    expect(announcementText()).toBe('');
  });

  it('anuncia el resultado desde un solo sitio', async () => {
    // Dos regiones diciendo el mismo número compiten por el turno de habla.
    // La de `ShareControls` es otra cosa —confirma que se copió el enlace— y
    // no debe entrar en esta cuenta.
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);

    await user.type(await screen.findByLabelText('Importe'), '100');
    await waitFor(() => expect(announcementText()).toMatch(/equivale a/));

    const saying = [...document.querySelectorAll('[aria-live]')].filter((region) =>
      /equivale a/.test(region.textContent ?? ''),
    );
    expect(saying).toHaveLength(1);
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
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('THB'));
  });

  it('muestra la tasa en la dirección legible, no en la que salga', async () => {
    // 1 ARS = 0,000911 EUR es correcto y no le sirve a nadie. La línea se da
    // siempre en la dirección cuya cifra llega a 1.
    mockRates({ ...SNAPSHOT, rates: { ...SNAPSHOT.rates, ARS: 1010 } });
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(await screen.findByRole('button', { name: /país viajas/ }));
    await user.type(screen.getByRole('combobox'), 'Argentina');
    await user.click(screen.getByRole('option', { name: /Argentina/ }));

    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('1 EUR ='));
    expect(screen.getByText(RATE_LINE)).not.toHaveTextContent('0,000');
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
    expect(screen.queryByText(RATE_LINE)).not.toBeInTheDocument();
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
    expect(await screen.findByText(/1 EUR = 1,08696 USD/)).toBeInTheDocument();
  });

  it('explains the failure differently when the device is offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    mockRates({}, false);
    render(<Converter />);

    expect(
      await screen.findByText('Conéctate a internet para obtener las tasas más recientes.'),
    ).toBeInTheDocument();
  });

  it('sigue convirtiendo con la última tabla cuando el proveedor falla', async () => {
    // Una tabla de esta mañana convierte una cuenta de restaurante
    // perfectamente; una pantalla de reintento no convierte nada, y aparece
    // justo cuando el viajero está fuera con una conexión que ya le falla.
    window.localStorage.setItem(
      APP_CONFIG.storageKeys.lastRates,
      JSON.stringify({ ...SNAPSHOT, fetchedAt: new Date(Date.now() - 3_600_000).toISOString() }),
    );
    mockRates({}, false);
    const user = userEvent.setup();
    render(<Converter />);

    expect(await screen.findByText(RATE_LINE)).toBeInTheDocument();
    expect(screen.queryByText('No hemos podido obtener las tasas')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Importe'), '100');
    await waitFor(async () => expect(await resultText()).toMatch(/92/));
  });

  it('dice que la cotización no es de ahora, en lugar de presentarla como fresca', async () => {
    window.localStorage.setItem(APP_CONFIG.storageKeys.lastRates, JSON.stringify(SNAPSHOT));
    mockRates({}, false);
    render(<Converter />);

    expect(await screen.findByText(/Última cotización disponible/)).toBeInTheDocument();
    expect(screen.queryByText(/^Actualizado/)).not.toBeInTheDocument();
  });

  it('guarda cada tabla que llega, para la próxima vez', async () => {
    mockRates(SNAPSHOT);
    render(<Converter />);
    await screen.findByLabelText('Importe');

    await waitFor(() =>
      expect(window.localStorage.getItem(APP_CONFIG.storageKeys.lastRates)).toContain('"base"'),
    );
  });

  it('muestra el estado vacío solo cuando nunca hubo datos', async () => {
    // Sin nada guardado no hay nada honesto que enseñar: ADR-013 prohíbe
    // inventarse una tasa para rellenar la pantalla.
    mockRates({}, false);
    render(<Converter />);

    expect(await screen.findByText('No hemos podido obtener las tasas')).toBeInTheDocument();
    expect(screen.queryByText(RATE_LINE)).not.toBeInTheDocument();
  });

  it('descarta una tabla guardada corrupta en vez de convertir con ella', async () => {
    window.localStorage.setItem(
      APP_CONFIG.storageKeys.lastRates,
      JSON.stringify({ ...SNAPSHOT, rates: { USD: 1, EUR: 0 } }),
    );
    mockRates({}, false);
    render(<Converter />);

    expect(await screen.findByText('No hemos podido obtener las tasas')).toBeInTheDocument();
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
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('GBP'));
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
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());

    expect(screen.getByText(RATE_LINE)).toHaveTextContent('JPY');
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.homeCurrency)).toBe('JPY');
  });

  it('keeps the configured default when the region names no currency we carry', async () => {
    mockRates(SNAPSHOT);
    withLocale('en');
    render(<Converter />);

    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
    expect(screen.getByText(RATE_LINE)).toHaveTextContent(APP_CONFIG.defaultHomeCurrency);
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
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
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

    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('JPY'));
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

describe('Converter — share', () => {
  /**
   * `navigator.share` and `navigator.clipboard` are getter-only on the
   * prototype, so they are defined on the instance and removed afterwards —
   * leaving one behind would silently change which branch the next test takes.
   */
  const stubbed: string[] = [];
  function stubNavigator(props: Record<string, unknown>) {
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(navigator, key, { value, configurable: true });
      stubbed.push(key);
    }
  }

  afterEach(() => {
    for (const key of stubbed.splice(0)) {
      delete (navigator as unknown as Record<string, unknown>)[key];
    }
  });

  function shareButton() {
    return screen.getByRole('button', { name: /Compartir|Copiar enlace/ });
  }

  async function ready() {
    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
  }

  it('restores country, currency and amount from a shared link', async () => {
    window.history.replaceState(null, '', '/?country=TH&to=JPY&amount=1890');
    mockRates(SNAPSHOT);
    render(<Converter />);
    await ready();

    expect(screen.getByRole('button', { name: /país viajas/ })).toHaveTextContent('Tailandia');
    // A link may have been hand-written, so its amount is read the same way the
    // conversion reads it and then shown grouped, like anything else typed.
    expect(screen.getByLabelText('Importe')).toHaveValue('1.890');
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('JPY'));
  });

  it('shows a hand-written decimal amount as the number it means', async () => {
    // `1890.5` in a URL is a decimal, not 18905: the field defers to
    // `parseAmount` for links rather than assuming it wrote the separator.
    window.history.replaceState(null, '', '/?country=TH&to=JPY&amount=1890.5');
    mockRates(SNAPSHOT);
    render(<Converter />);
    await ready();

    expect(screen.getByLabelText('Importe')).toHaveValue('1.890,5');
  });

  it('does not let detection overrule a currency the link named', async () => {
    // A shared price is a statement about which conversion to show. Guessing
    // over it would make links unreliable in exactly the case they exist for.
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    window.history.replaceState(null, '', '/?country=TH&to=JPY');
    mockRates(SNAPSHOT);
    render(<Converter />);
    await ready();

    await waitFor(() => expect(screen.getByText(RATE_LINE)).toHaveTextContent('JPY'));
  });

  it('ignores the broken half of a mangled link', async () => {
    window.history.replaceState(null, '', '/?country=TH&to=NOPE');
    mockRates(SNAPSHOT);
    render(<Converter />);
    await ready();

    expect(screen.getByRole('button', { name: /país viajas/ })).toHaveTextContent('Tailandia');
    expect(screen.getByText(RATE_LINE)).toHaveTextContent(APP_CONFIG.defaultHomeCurrency);
  });

  it('writes the conversion into the address bar', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    await user.type(screen.getByLabelText('Importe'), '1890');

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      // The link carries the field's text, which is now grouped — and reads
      // back to the same number, so what the recipient sees is what was sent.
      expect(params.get('amount')).toBe('1.890');
      expect(params.get('country')).toBe('US');
      expect(params.get('to')).toBe('EUR');
    });
  });

  it('replaces rather than pushes, so back does not walk through every keystroke', async () => {
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, 'pushState');
    render(<Converter />);
    await ready();

    await user.type(screen.getByLabelText('Importe'), '1890');
    await waitFor(() => expect(window.location.search).toContain('amount=1.890'));

    expect(pushState).not.toHaveBeenCalled();
  });

  it('hands the native share sheet the link, where the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share });
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    render(<Converter />);
    await ready();

    await user.click(shareButton());

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0]?.[0]?.url).toContain('country=US');
  });

  it('copies to the clipboard when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockRates(SNAPSHOT);
    // After `setup`, which installs a clipboard stub of its own.
    const user = userEvent.setup();
    stubNavigator({ clipboard: { writeText } });
    render(<Converter />);
    await ready();

    await user.click(shareButton());

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0]?.[0]).toContain('to=EUR');
    expect(await screen.findByText('Enlace copiado')).toBeInTheDocument();
  });

  it('stays quiet when the user dismisses the share sheet', async () => {
    // Dismissing is a decision, not a failure — falling back to a clipboard
    // write would hand them a link they just declined to send.
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockRates(SNAPSHOT);
    const user = userEvent.setup();
    stubNavigator({ share, clipboard: { writeText } });
    render(<Converter />);
    await ready();

    await user.click(shareButton());

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText('Enlace copiado')).not.toBeInTheDocument();
  });

  it('leaves the conversion untouched when the link is shared', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockRates(SNAPSHOT);
    // After `setup`, which installs a clipboard stub of its own.
    const user = userEvent.setup();
    stubNavigator({ clipboard: { writeText } });
    render(<Converter />);
    await ready();

    await user.type(screen.getByLabelText('Importe'), '100');
    const before = await resultText();
    await user.click(shareButton());

    expect(await resultText()).toBe(before);
  });
});

describe('Converter — tipo de cambio en Argentina', () => {
  const VARIANTS_KEY = APP_CONFIG.storageKeys.rateVariants;

  /** ARS oficial en la tabla base; blue y tarjeta llegan como variantes. */
  const WITH_VARIANTS = {
    ...SNAPSHOT,
    rates: { ...SNAPSHOT.rates, ARS: 1000 },
    variants: {
      ARS: [
        { id: 'official', rate: 1000, source: 'test', fetchedAt: SNAPSHOT.fetchedAt },
        { id: 'blue', rate: 1250, source: 'test', fetchedAt: SNAPSHOT.fetchedAt },
        { id: 'card', rate: 1300, source: 'test', fetchedAt: SNAPSHOT.fetchedAt },
      ],
    },
  };

  async function argentina(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByLabelText('Importe');
    await user.click(screen.getByRole('button', { name: /país viajas/ }));
    await user.type(screen.getByRole('combobox'), 'Argentina');
    await user.click(await screen.findByRole('option', { name: /Argentina/ }));
  }

  it('ofrece las tres cotizaciones al elegir Argentina', async () => {
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    const group = await screen.findByRole('radiogroup', { name: 'Tipo de cambio' });
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
  });

  it('usa el blue por defecto y lo dice en la línea de tasa', async () => {
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    const blue = await screen.findByRole('radio', { name: /Blue/ });
    expect(blue).toHaveAttribute('aria-checked', 'true');
    // 1 ARS = 0,92/1250 EUR con el blue, no 0,92/1000 con el oficial.
    expect(screen.getByText(RATE_LINE)).toHaveTextContent('Blue');
  });

  it('lleva su título a la vista, como el resto de controles', async () => {
    // Era el único control de la pantalla cuyo título vivía solo en un
    // `aria-label`: quien miraba veía tres pastillas sin explicar.
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    const label = await screen.findByText('Tipo de cambio');
    expect(label).toBeVisible();
    // Y un solo nombre accesible, el de la etiqueta visible — no dos.
    expect(screen.getByRole('radiogroup', { name: 'Tipo de cambio' })).toHaveAttribute(
      'aria-labelledby',
      label.id,
    );
  });

  it('explica qué significa la cotización elegida', async () => {
    // «Blue» no le dice nada a quien llega por primera vez, y hasta ahora esa
    // explicación solo existía en el nombre accesible del botón.
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    expect(await screen.findByText('Efectivo, el que usan los viajeros')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Tarjeta/ }));
    expect(await screen.findByText('Al pagar con tarjeta')).toBeInTheDocument();
    expect(screen.queryByText('Efectivo, el que usan los viajeros')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Oficial/ }));
    expect(await screen.findByText('El oficial del banco central')).toBeInTheDocument();
  });

  it('no repite la explicación a un lector de pantalla', async () => {
    // El nombre accesible del botón ya la lleva; la línea visible es para
    // quien ve la pantalla, y anunciarla otra vez sería decirlo dos veces.
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    const hint = await screen.findByText('Efectivo, el que usan los viajeros');
    expect(hint).toHaveAttribute('aria-hidden', 'true');
  });

  it('se queda sin línea, no rota, ante una cotización que no conoce', async () => {
    // `variantsFor` conserva a propósito lo que no reconoce: un «mep» que
    // añada la fuente mañana llega hasta aquí sin texto que mostrar.
    const withMep = {
      ...SNAPSHOT,
      rates: { ...SNAPSHOT.rates, ARS: 1000 },
      variants: {
        ARS: [
          { id: 'mep', rate: 1180, source: 'test', fetchedAt: new Date().toISOString() },
          { id: 'official', rate: 1000, source: 'test', fetchedAt: new Date().toISOString() },
        ],
      },
    };
    mockRates(withMep);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /mep/i }));
    expect(screen.getByText(RATE_LINE)).toBeInTheDocument();
  });

  it('cambia el resultado al cambiar de cotización', async () => {
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);
    await user.type(screen.getByLabelText('Importe'), '100000');

    const conBlue = await resultText();
    await user.click(await screen.findByRole('radio', { name: /Oficial/ }));

    const conOficial = await resultText();
    expect(conOficial).not.toBe(conBlue);
    // El oficial sobrevalora el peso, así que el mismo precio cuesta más.
    expect(screen.getByText(RATE_LINE)).toHaveTextContent('Oficial');
  });

  it('recuerda la elección entre visitas', async () => {
    window.localStorage.setItem(VARIANTS_KEY, JSON.stringify({ ARS: 'card' }));
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    expect(await screen.findByRole('radio', { name: /Tarjeta/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('guarda la elección al hacerla', async () => {
    mockRates(WITH_VARIANTS);
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);
    await user.click(await screen.findByRole('radio', { name: /Tarjeta/ }));

    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(VARIANTS_KEY)!)).toEqual({ ARS: 'card' }),
    );
  });

  it('no muestra nada de esto en el resto de destinos', async () => {
    // La garantía que importa: el resto del mundo se ve exactamente igual.
    mockRates(WITH_VARIANTS);
    render(<Converter />);
    await screen.findByLabelText('Importe');
    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText(RATE_LINE)).not.toHaveTextContent('·');
  });

  it('cae a la tasa oficial sin selector cuando la superposición falla', async () => {
    // El proveedor comunitario caído no puede romper la app: sin variantes, el
    // comportamiento es exactamente el de antes de que existiera esta capa.
    mockRates({ ...SNAPSHOT, rates: { ...SNAPSHOT.rates, ARS: 1000 } });
    const user = userEvent.setup();
    render(<Converter />);
    await argentina(user);

    await waitFor(() => expect(screen.getByText(RATE_LINE)).toBeInTheDocument());
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText(RATE_LINE)).not.toHaveTextContent('·');
  });
});
