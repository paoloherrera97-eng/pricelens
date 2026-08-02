'use client';

import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui';

export interface ConversionResultProps {
  /** The user's amount, formatted in the source currency. */
  original: string;
  /** The converted amount, formatted in the target currency. */
  converted: string | null;
  /** The effective pair rate line, already formatted. */
  rateLine: string | null;
  isLoading: boolean;
}

/**
 * The visual centre of gravity.
 *
 * The converted amount is the largest thing on screen because it is the one
 * thing the user came for. Everything else is subordinate — including the rate
 * line, which exists so the working is visible and the number is trustable.
 */
export function ConversionResult({
  original,
  converted,
  rateLine,
  isLoading,
}: ConversionResultProps) {
  const t = useTranslations('converter');

  return (
    <div className="text-center">
      <p className="text-sm text-neutral-500">{t('resultLabel')}</p>

      {/* Polite, so the result is announced without interrupting typing. The
          region is always present: an aria-live container mounted at the same
          moment as its content is frequently not announced at all. */}
      <div aria-live="polite" aria-atomic="true" className="mt-0.5 min-h-9">
        {isLoading ? (
          <Skeleton className="mx-auto h-6 w-24" />
        ) : converted ? (
          <>
            <p className="tabular text-display-sm sm:text-display leading-none font-bold text-neutral-900">
              {converted}
            </p>
            <span className="sr-only">{t('announcement', { amount: original, converted })}</span>
          </>
        ) : (
          <p className="text-base text-neutral-500">{t('unavailablePair')}</p>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="mx-auto mt-1 h-2 w-20" />
      ) : (
        rateLine && <p className="tabular mt-1 text-sm text-neutral-500">{rateLine}</p>
      )}
    </div>
  );
}
