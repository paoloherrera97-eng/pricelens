'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card, IconButton, Input } from '@/components/ui';
import {
  APP_CONFIG,
  DEFAULT_LOCALE,
  FEATURES,
  LOCALE_FORMATTING,
  countryForCurrency,
  getCountry,
  getCurrency,
  isCurrencyCode,
  type CurrencyCode,
} from '@/config';
import { useAmountField } from '@/hooks/useAmountField';
import { useDetectedHomeCurrency } from '@/hooks/useDetectedHomeCurrency';
import { useFavourites } from '@/hooks/useFavourites';
import { useRateVariant } from '@/hooks/useRateVariant';
import { useSharedLink } from '@/hooks/useSharedLink';
import { useShareUrl } from '@/hooks/useShareUrl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useRates } from '@/hooks/useRates';
import { convert, getRate } from '@/lib/currency/convert';
import { describeAge, formatCurrency, formatRate, isStale } from '@/lib/currency/format';
import { isFavourite, type Favourite } from '@/lib/favourites/favourites';
import { applyVariant, resolveVariant, variantsFor } from '@/lib/rates/variants';
import type { PartialShareState } from '@/lib/share/url';
import { parseAmount } from '@/lib/currency/parse';

import { ConversionResult } from './ConversionResult';
import { ConverterSkeleton } from './ConverterSkeleton';
import { CountryPicker } from './CountryPicker';
import { CurrencyPicker } from './CurrencyPicker';
import { FavouriteList } from './FavouriteList';
import { FavouriteToggle } from './FavouriteToggle';
import { RateFreshness } from './RateFreshness';
import { RateVariantPicker } from './RateVariantPicker';
import { ShareControls } from './ShareControls';
import { SwapButton } from './SwapButton';

const LOCALE = LOCALE_FORMATTING[DEFAULT_LOCALE];

/** A stable no-op, so skipping detection does not itself churn the effect. */
const NO_DETECTION = () => {};

/** The country shown on a cold start, derived from the configured default. */
const DEFAULT_COUNTRY = countryForCurrency(APP_CONFIG.defaultForeignCurrency)?.code ?? 'US';

/**
 * The conversion screen.
 *
 * Holds the only mutable state in the app: the amount, the country being
 * visited, and the home currency. Everything else — the converted value, the
 * rate, the freshness — is derived, because derived state that gets stored is
 * state that gets stale.
 */
export function Converter() {
  const t = useTranslations('converter');
  const tRates = useTranslations('rates');
  const tError = useTranslations('errors');
  const tVariants = useTranslations('rateVariants');
  const rates = useRates();
  const isOnline = useOnlineStatus();

  const [amountText, setAmountText] = useState('');

  // The country is the affordance; the currency is derived from it. Travelers
  // know where they are, not always what it is called there (ADR-014).
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const country = getCountry(countryCode);
  const from: CurrencyCode = country?.currency ?? APP_CONFIG.defaultForeignCurrency;

  // The home currency is the one value worth remembering between visits: it does
  // not change between trips, and re-picking it every time taxes the 3-second
  // promise (ADR-005). The country is deliberately not persisted — it changes
  // per trip, and a stale value would be actively misleading.
  const [to, setTo] = useLocalStorage<CurrencyCode>(
    APP_CONFIG.storageKeys.homeCurrency,
    APP_CONFIG.defaultHomeCurrency,
    (raw) => (isCurrencyCode(raw) ? raw : null),
  );

  const amount = useMemo(() => parseAmount(amountText) ?? 0, [amountText]);

  // A few currencies are quoted several ways — Argentina is why this exists.
  // The choice is resolved here and substituted into the table *before* any
  // conversion happens, so `getRate` and `convert` never learn that variants
  // exist and stay exactly as pure as ADR-001 requires.
  const { selection, select } = useRateVariant();
  const variants = useMemo(
    () =>
      FEATURES.rateVariants && rates.status === 'ready'
        ? variantsFor(rates.snapshot.variants, from)
        : [],
    [rates, from],
  );
  const activeVariant = useMemo(
    () => resolveVariant(variants, selection, from),
    [variants, selection, from],
  );

  /**
   * The whole conversion, recomputed only when an input actually changes.
   * No network, no debounce — this is arithmetic (ADR-001).
   */
  const conversion = useMemo(() => {
    if (rates.status !== 'ready') return null;

    // `applyVariant` returns the same object when there is nothing to
    // substitute, so every destination that is not Argentina allocates nothing.
    const table = applyVariant(rates.snapshot.rates, from, activeVariant);
    const rate = getRate(table, from, to);
    const converted = convert(amount, table, from, to);
    if (rate === null || converted === null) return null;

    return {
      converted: formatCurrency(converted, to, LOCALE),
      // La variante se nombra en la propia línea de tasa. Sin eso el número
      // queda sin atribuir, que es justo el fallo que ADR-013 existe para
      // evitar — y no cuesta una línea extra de alto.
      rateLine:
        t('rateLine', { from, to, rate: formatRate(rate, LOCALE) }) +
        (activeVariant ? ` · ${tVariants(`${activeVariant.id}.short`)}` : ''),
    };
  }, [rates, amount, from, to, t, tVariants, activeVariant]);

  const originalFormatted = useMemo(() => formatCurrency(amount, from, LOCALE), [amount, from]);

  const freshness = useMemo(() => {
    if (rates.status !== 'ready') return null;
    const now = new Date();
    return {
      age: describeAge(rates.snapshot.fetchedAt, now),
      stale: isStale(rates.snapshot.fetchedAt, now, APP_CONFIG.ratesStaleAfterSeconds),
    };
  }, [rates]);

  // El campo guarda el texto **ya formateado** («1.234,50»), no el crudo.
  // `parseAmount` ya entiende la agrupación, así que la conversión, el enlace
  // compartido y los favoritos siguen leyendo exactamente lo mismo que antes.
  const amountField = useAmountField(amountText, setAmountText, LOCALE);

  const handleSwap = useCallback(() => {
    // Swapping is currency-level; the country selector follows to whichever
    // country best represents the new foreign currency.
    setCountryCode(countryForCurrency(to)?.code ?? countryCode);
    setTo(from);
  }, [from, to, countryCode, setTo]);

  // Choosing a country whose currency is already the home currency swaps instead
  // of producing a 1:1 dead end (PRD E8).
  const handleCountryChange = useCallback(
    (next: string) => {
      const nextCurrency = getCountry(next)?.currency;
      if (nextCurrency && nextCurrency === to) {
        setTo(from);
      }
      setCountryCode(next);
    },
    [from, to, setTo],
  );

  const handleHomeChange = useCallback(
    (next: CurrencyCode) => {
      if (next === from) {
        setCountryCode(countryForCurrency(to)?.code ?? countryCode);
      }
      setTo(next);
    },
    [from, to, countryCode, setTo],
  );

  // Favourites are a shortcut over the two selectors, not a third input: they
  // set the same state the pickers do and own none of their own.
  const { favourites, toggle } = useFavourites();
  const currentPair = useMemo<Favourite>(() => ({ country: countryCode, to }), [countryCode, to]);
  const isCurrentSaved = useMemo(
    () => isFavourite(favourites, currentPair),
    [favourites, currentPair],
  );

  const handleToggleFavourite = useCallback(() => toggle(currentPair), [toggle, currentPair]);

  const handleSelectFavourite = useCallback(
    (favourite: Favourite) => {
      // Both at once, and deliberately not through the picker handlers: those
      // exist to resolve a collision when *one* side changes, and here both
      // sides are known good — the pair was saved as a working pair.
      setCountryCode(favourite.country);
      setTo(favourite.to);
    },
    [setTo],
  );

  // A link the user opened is a statement about which conversion to show, so it
  // is applied before anything guesses on their behalf.
  const applyShared = useCallback(
    (shared: PartialShareState) => {
      if (shared.country) setCountryCode(shared.country);
      if (shared.to) setTo(shared.to);
      if (shared.amount !== undefined) setAmountText(amountField.format(shared.amount));
    },
    [setTo, amountField],
  );

  const { hadHomeCurrency } = useSharedLink(applyShared);

  // A first-time visitor gets their own currency guessed from the device rather
  // than the configured default. Routed through the handler above rather than
  // `setTo`, so a guess that collides with the destination country resolves the
  // same way a manual pick would instead of leaving a 1:1 dead end.
  //
  // Skipped when the link named a currency: guessing over a shared price would
  // make shared links unreliable in exactly the case they exist for.
  useDetectedHomeCurrency(hadHomeCurrency ? NO_DETECTION : handleHomeChange);

  const shareUrl = useShareUrl(
    useMemo(
      () => ({ country: countryCode, to, amount: amountText }),
      [countryCode, to, amountText],
    ),
  );

  if (rates.status === 'loading') {
    return <ConverterSkeleton label={tRates('loading')} />;
  }

  if (rates.status === 'error') {
    return (
      <Card className="text-center">
        <p className="text-fg text-base font-medium">{tError('ratesUnavailableTitle')}</p>
        <p className="text-fg-muted mt-1 text-sm">
          {isOnline ? tError('ratesUnavailableBody') : tError('offlineBody')}
        </p>
        <Button className="mt-3" onClick={rates.retry} isFullWidth size="lg">
          {tError('retry')}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-1.5 md:gap-2">
      {!isOnline && (
        <p
          role="status"
          className="bg-warning-50 text-warning-600 rounded-md px-2 py-1 text-center text-xs font-medium"
        >
          {tRates('offlineBanner')}
        </p>
      )}

      <CountryPicker label={t('countryLabel')} value={countryCode} onChange={handleCountryChange} />

      {/* Directamente bajo el país porque es una propiedad del destino, no del
          importe: en Argentina el precio cambia según cómo pagues. Solo aparece
          donde hay más de una cotización, así que el resto de destinos se ven
          exactamente igual que antes. */}
      {activeVariant && variants.length > 1 && (
        <RateVariantPicker
          className="-mt-1"
          variants={variants}
          selectedId={activeVariant.id}
          onSelect={(variantId) => select(from, variantId)}
        />
      )}

      {/* No currency selector here: the country above already determines the
          currency, and its symbol leads the field. Repeating the code would be
          the same information twice on the screen the user reads fastest. */}
      <Input
        label={t('amountLabel')}
        className="text-lg"
        isEmphasised
        inputMode="decimal"
        // A numeric keypad and a focused field mean the traveler can start
        // typing without a single tap.
        autoFocus
        enterKeyHint="done"
        placeholder={t('amountPlaceholder')}
        leading={getCurrency(from).symbol}
        value={amountText}
        inputRef={amountField.inputRef}
        onChange={amountField.onChange}
        // Clearing a long price one backspace at a time is the kind of small
        // friction that adds up on a phone. Appears only when there is
        // something to clear, so the resting field stays uncluttered.
        trailing={
          amountText ? (
            <IconButton label={t('clear')} variant="ghost" onClick={() => setAmountText('')}>
              <svg className="size-2" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          ) : undefined
        }
      />

      <div className="flex justify-center">
        <SwapButton onSwap={handleSwap} />
      </div>

      {/* The star sits on the home-currency row because that row is where the
          pair is completed — by the time it is reachable, both halves of the
          favourite exist. */}
      <div className="flex items-end gap-0.5">
        <CurrencyPicker
          className="min-w-0 flex-1"
          label={t('toLabel')}
          value={to}
          onChange={handleHomeChange}
        />
        {FEATURES.favourites && (
          <FavouriteToggle isSaved={isCurrentSaved} onToggle={handleToggleFavourite} />
        )}
      </div>

      <ConversionResult
        original={originalFormatted}
        converted={conversion?.converted ?? null}
        rateLine={conversion?.rateLine ?? null}
        isLoading={false}
        isEmpty={amountText.trim() === ''}
      />

      {/* Debajo del resultado, no encima. Un favorito no es una entrada de
          *esta* conversión: es el atajo para empezar la siguiente. Encima
          separaba el selector de moneda de su propia respuesta —la adyacencia
          más importante de la pantalla— y empujaba el resultado fuera del
          pliegue en cuanto había un favorito guardado. */}
      {FEATURES.favourites && (
        <FavouriteList
          favourites={favourites}
          current={currentPair}
          onSelect={handleSelectFavourite}
        />
      )}

      <ShareControls url={shareUrl} title={t('shareTitle', { from, to })} />

      {freshness && (
        <RateFreshness age={freshness.age} isStale={freshness.stale} isOffline={!isOnline} />
      )}
    </Card>
  );
}
