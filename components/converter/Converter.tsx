'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card, Input } from '@/components/ui';
import {
  APP_CONFIG,
  LOCALE_FORMATTING,
  DEFAULT_LOCALE,
  getCurrency,
  isCurrencyCode,
  type CurrencyCode,
} from '@/config';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRates } from '@/hooks/useRates';
import { convert, getRate } from '@/lib/currency/convert';
import { describeAge, formatCurrency, formatRate, isStale } from '@/lib/currency/format';
import { parseAmount, sanitizeAmountInput } from '@/lib/currency/parse';

import { ConversionResult } from './ConversionResult';
import { CurrencyPicker } from './CurrencyPicker';
import { RateFreshness } from './RateFreshness';
import { SwapButton } from './SwapButton';

const LOCALE = LOCALE_FORMATTING[DEFAULT_LOCALE];

/**
 * The conversion screen.
 *
 * Holds the only mutable state in the app: the amount and the two currencies.
 * Everything else — the converted value, the rate, the freshness — is derived,
 * because derived state that gets stored is state that gets stale.
 */
export function Converter() {
  const t = useTranslations('converter');
  const tError = useTranslations('errors');
  const rates = useRates();
  const isOnline = useOnlineStatus();

  const [amountText, setAmountText] = useState('');
  const [from, setFrom] = useState<CurrencyCode>(APP_CONFIG.defaultForeignCurrency);

  // The home currency is the one value worth remembering between visits: it does
  // not change between trips, and re-picking it every time taxes the 3-second
  // promise (ADR-005). The foreign currency is deliberately not persisted.
  const [to, setTo] = useLocalStorage<CurrencyCode>(
    APP_CONFIG.storageKeys.homeCurrency,
    APP_CONFIG.defaultHomeCurrency,
    (raw) => (isCurrencyCode(raw) ? raw : null),
  );

  const amount = useMemo(() => parseAmount(amountText) ?? 0, [amountText]);

  /**
   * The whole conversion, recomputed only when an input actually changes.
   * No network, no debounce — this is arithmetic (ADR-001).
   */
  const conversion = useMemo(() => {
    if (rates.status !== 'ready') return null;

    const table = rates.snapshot.rates;
    const rate = getRate(table, from, to);
    const converted = convert(amount, table, from, to);
    if (rate === null || converted === null) return null;

    return {
      rate,
      converted: formatCurrency(converted, to, LOCALE),
      rateLine: t('rateLine', { from, to, rate: formatRate(rate, LOCALE) }),
    };
  }, [rates, amount, from, to, t]);

  const originalFormatted = useMemo(() => formatCurrency(amount, from, LOCALE), [amount, from]);

  const freshness = useMemo(() => {
    if (rates.status !== 'ready') return null;
    const now = new Date();
    return {
      age: describeAge(rates.snapshot.fetchedAt, now),
      stale: isStale(rates.snapshot.fetchedAt, now, APP_CONFIG.ratesStaleAfterSeconds),
    };
  }, [rates]);

  const handleAmountChange = useCallback((raw: string) => {
    // Invalid characters never appear rather than producing an error (PRD FR-1).
    setAmountText(sanitizeAmountInput(raw));
  }, []);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to, setTo]);

  // Choosing the currency already selected on the other side swaps instead of
  // producing a 1:1 dead end (PRD E8).
  const handleFromChange = useCallback(
    (next: CurrencyCode) => (next === to ? handleSwap() : setFrom(next)),
    [to, handleSwap],
  );
  const handleToChange = useCallback(
    (next: CurrencyCode) => (next === from ? handleSwap() : setTo(next)),
    [from, handleSwap, setTo],
  );

  if (rates.status === 'error') {
    return (
      <Card className="text-center">
        <p className="text-base font-medium text-neutral-900">{tError('ratesUnavailableTitle')}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {isOnline ? tError('ratesUnavailableBody') : tError('offlineBody')}
        </p>
        <Button className="mt-3" onClick={rates.retry} isFullWidth size="lg">
          {tError('retry')}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-2">
      {/* `min-w-0` on the growing child is load-bearing: a flex item defaults to
          `min-width: auto`, so without it the amount field refuses to shrink and
          pushes the currency picker off the side of a phone screen. */}
      <div className="flex items-end gap-1">
        <div className="min-w-0 flex-1">
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
            onChange={(event) => handleAmountChange(event.target.value)}
          />
        </div>
        <CurrencyPicker
          label={t('fromLabel')}
          value={from}
          onChange={handleFromChange}
          className="w-14 shrink-0"
          isCompact
        />
      </div>

      <div className="flex justify-center">
        <SwapButton onSwap={handleSwap} />
      </div>

      <CurrencyPicker label={t('toLabel')} value={to} onChange={handleToChange} />

      <ConversionResult
        original={originalFormatted}
        converted={conversion?.converted ?? null}
        rateLine={conversion?.rateLine ?? null}
        isLoading={rates.status === 'loading'}
      />

      {freshness && (
        <RateFreshness age={freshness.age} isStale={freshness.stale} isOffline={!isOnline} />
      )}
    </Card>
  );
}
