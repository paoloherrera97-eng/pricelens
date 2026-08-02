'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { Select, type SelectOption } from '@/components/ui';
import { COUNTRIES, getCurrency } from '@/config';

import { Flag } from './Flag';

export interface CountryPickerProps {
  label: string;
  /** ISO 3166-1 alpha-2 code of the selected country. */
  value: string;
  onChange: (countryCode: string) => void;
  className?: string;
}

/**
 * Built once at module scope — 195 static entries that never change.
 *
 * The flag leads because it is recognised faster than any string, and the
 * currency trails as reassurance rather than as the thing being chosen. The
 * flag is `aria-hidden` inside `Flag`, so each option's accessible name stays
 * the country name alone.
 */
const OPTIONS: readonly SelectOption[] = COUNTRIES.map((country) => {
  const currency = getCurrency(country.currency);
  return {
    value: country.code,
    leading: <Flag emoji={country.flag} code={country.code} />,
    label: country.name,
    description: currency.code,
    meta: currency.symbol === currency.code ? undefined : currency.symbol,
    // Searchable by currency too, for the traveler who does know the code.
    keywords: [country.code, currency.code, currency.name],
  };
});

/**
 * "Which country are you visiting?" — the question a traveler can answer.
 *
 * Asking for a currency asks them to translate their situation into a code
 * first. Asking for a country does the translation for them (ADR-014).
 */
export function CountryPicker({ label, value, onChange, className }: CountryPickerProps) {
  const t = useTranslations('countryPicker');

  const handleChange = useCallback((next: string) => onChange(next), [onChange]);

  return (
    <Select
      label={label}
      value={value}
      options={OPTIONS}
      onChange={handleChange}
      searchLabel={t('search')}
      noResultsLabel={t('noResults')}
      className={className}
    />
  );
}
