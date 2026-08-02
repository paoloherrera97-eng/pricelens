'use client';

import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export interface ConversionResultProps {
  /** The user's amount, formatted in the source currency. */
  original: string;
  /** The converted amount, formatted in the target currency. */
  converted: string | null;
  /** The effective pair rate line, already formatted. */
  rateLine: string | null;
  isLoading: boolean;
  /** True before the user has entered anything — shows the resting state. */
  isEmpty?: boolean;
}

/**
 * The visual centre of gravity.
 *
 * Given its own tinted surface rather than sitting inline with the inputs: the
 * converted amount is the one thing the user came for, and a change of surface
 * separates "what I asked" from "what it means" faster than spacing alone.
 *
 * `key={converted}` on the value re-triggers the 140ms entrance whenever the
 * number actually changes, so a new answer registers as new. The digits
 * themselves never animate — counting up would trade comprehension for a
 * flourish, against the 3-second promise.
 */
export function ConversionResult({
  original,
  converted,
  rateLine,
  isLoading,
  isEmpty = false,
}: ConversionResultProps) {
  const t = useTranslations('converter');

  return (
    <div className="bg-sunken ring-outline-soft rounded-xl px-2 py-2 text-center ring-1 md:py-3">
      <p className="text-fg-muted text-xs font-medium tracking-wide uppercase">
        {t('resultLabel')}
      </p>

      {/* Polite, so the result is announced without interrupting typing. The
          region is always present: an aria-live container mounted at the same
          moment as its content is frequently not announced at all. */}
      <div aria-live="polite" aria-atomic="true" className="mt-0.5 min-h-6 md:mt-1 md:min-h-8">
        {isLoading ? (
          <Skeleton className="mx-auto h-6 w-24" />
        ) : converted ? (
          <>
            <p
              key={converted}
              className={cn(
                'tabular text-display-sm sm:text-display animate-rise text-fg',
                // The empty state keeps the number in place but recedes, so the
                // layout never jumps when the first digit is typed. `fg-muted`
                // rather than `fg-subtle`: this is real text and must clear
                // 4.5:1 (fg-subtle measured 2.34:1 on the result surface).
                isEmpty && 'text-fg-muted',
              )}
            >
              {converted}
            </p>
            <span className="sr-only">{t('announcement', { amount: original, converted })}</span>
          </>
        ) : (
          <p className="text-fg-muted px-2 py-2 text-base">{t('unavailablePair')}</p>
        )}
      </div>

      {/* The rate line stays visible even with no amount entered: it is the
          exchange rate, which is useful on its own and is what makes the
          number above trustable when one appears. */}
      {isLoading ? (
        <Skeleton className="mx-auto mt-1 h-2 w-20" />
      ) : (
        rateLine && <p className="tabular text-fg-muted mt-1 text-sm">{rateLine}</p>
      )}
    </div>
  );
}
