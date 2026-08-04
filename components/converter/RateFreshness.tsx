'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils/cn';
import type { RateAge } from '@/lib/currency/format';

export interface RateFreshnessProps {
  age: RateAge | null;
  isStale: boolean;
  isOffline: boolean;
  /** True when the table came from the last successful fetch, not from this one. */
  isDegraded?: boolean;
}

/**
 * States when the rates were last updated.
 *
 * Exists because of Value #4 in the Project Bible: a number shown without any
 * indication of how current it is asks the user to trust it blindly. Amber
 * marks "working, but not fresh" — red would imply failure when the app is
 * fine, green would misrepresent stale data as live.
 */
export function RateFreshness({ age, isStale, isOffline, isDegraded = false }: RateFreshnessProps) {
  const t = useTranslations('rates');
  if (!age) return null;

  const relative =
    age.unit === 'now'
      ? t('justNow')
      : age.unit === 'minutes'
        ? t('minutesAgo', { count: age.count })
        : age.unit === 'hours'
          ? t('hoursAgo', { count: age.count })
          : t('daysAgo', { count: age.count });

  const isWarning = isStale || isOffline || isDegraded;

  return (
    <p
      className={cn(
        'flex items-center justify-center gap-1 text-xs font-medium',
        isWarning ? 'text-warning-600' : 'text-fg-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-1 rounded-full',
          isWarning ? 'bg-warning-600' : 'bg-success-600',
        )}
      />
      <span>
        {isOffline ? `${t('offline')} · ` : ''}
        {/* Cuando la tabla viene de la última descarga que sí funcionó, decirlo
            reemplaza al «Actualizado hace X» en lugar de acompañarlo: la hora
            sigue siendo cierta, pero «actualizado» ya no lo es. */}
        {isDegraded ? t('lastAvailable', { relative }) : t('updated', { relative })}
        {isStale ? ` · ${t('stale')}` : ''}
      </span>
    </p>
  );
}
