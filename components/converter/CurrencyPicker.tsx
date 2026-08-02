'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Select, type SelectOption } from '@/components/ui';
import { CURRENCIES, type CurrencyCode } from '@/config';

export interface CurrencyPickerProps {
  label: string;
  isLabelHidden?: boolean;
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  className?: string;
  /** Code-only trigger, for the narrow slot beside the amount field. */
  isCompact?: boolean;
}

/**
 * The currency list, shaped once for the `Select` primitive.
 *
 * Built at module scope rather than per render: it is 156 static entries that
 * never change, so rebuilding it on every keystroke would be pure waste.
 */
const OPTIONS: readonly SelectOption[] = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: currency.code,
  description: currency.name,
  meta: currency.symbol === currency.code ? undefined : currency.symbol,
  // Travelers know the country, not always the code (PRD FR-2).
  keywords: [currency.region],
}));

export function CurrencyPicker({
  label,
  isLabelHidden,
  value,
  onChange,
  className,
  isCompact,
}: CurrencyPickerProps) {
  const t = useTranslations('currencyPicker');

  const handleChange = useMemo(() => (next: string) => onChange(next as CurrencyCode), [onChange]);

  return (
    <Select
      label={label}
      isLabelHidden={isLabelHidden}
      value={value}
      options={OPTIONS}
      onChange={handleChange}
      searchLabel={t('search')}
      noResultsLabel={t('noResults')}
      className={className}
      isCompact={isCompact}
    />
  );
}
