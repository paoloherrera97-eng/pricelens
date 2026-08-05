'use client';

import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/components/ui';
import { getCountry } from '@/config';
import { formatCurrency, formatRate, readableRate } from '@/lib/currency/format';
import { parseAmount } from '@/lib/currency/parse';
import type { HistoryEntry } from '@/lib/history/history';
import { cn } from '@/lib/utils/cn';

import { Flag } from './Flag';

export interface HistoryPanelProps {
  entries: readonly HistoryEntry[];
  locale: string;
  onReuse: (entry: HistoryEntry) => void;
  onRemove: (at: string) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * The last conversions, as a dialog.
 *
 * A bottom sheet on phones and a centred dialog above `sm`, matching `Select`:
 * a list that can run to twenty rows needs the screen, and reusing the shape
 * the country picker already established makes this an interaction the user has
 * met rather than a second convention.
 *
 * `role="dialog"` with `aria-modal`, focus moved onto the dialog on open and
 * returned to the opener on close, Escape to dismiss, and a press outside to
 * dismiss. Focus is deliberately not trapped in a loop — a short list behind
 * one button does not need the machinery, and every escape route is covered.
 */
export function HistoryPanel({
  entries,
  locale,
  onReuse,
  onRemove,
  onClear,
  onClose,
}: HistoryPanelProps) {
  const t = useTranslations('history');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  /** Whatever had focus when the panel opened, so it can be given back. */
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    // The dialog itself, not the first control: a screen reader then announces
    // the dialog and its title before the user starts moving through the list.
    panelRef.current?.focus();
    return () => {
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    },
    [onClose],
  );

  const when = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  return (
    <div
      // The scrim carries the outside-press dismissal, so a tap anywhere off
      // the panel closes it.
      className="animate-fade bg-overlay fixed inset-0 z-30 flex items-end justify-center sm:items-center sm:p-4"
      onPointerDown={onPointerDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'bg-surface ring-outline-soft animate-sheet flex w-full flex-col overflow-hidden shadow-lg ring-1',
          // Phone: bottom sheet, inside thumb reach.
          'max-h-[80dvh] rounded-t-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]',
          // Tablet and up: a centred dialog the width of the card.
          'sm:max-w-md sm:rounded-2xl sm:pb-1',
        )}
      >
        <header className="flex items-center justify-between gap-1 px-2 pt-1 pb-0.5">
          <h2 id={titleId} className="text-fg text-base font-semibold">
            {t('title')}
          </h2>
          <IconButton label={t('close')} variant="ghost" onClick={onClose}>
            <svg className="size-2" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </header>

        {entries.length === 0 ? (
          <p className="text-fg-muted px-2 pt-1 pb-3 text-center text-sm">{t('empty')}</p>
        ) : (
          <>
            {/* `min-h-0` is what makes this scroll: a flex item refuses to
                shrink below its content without it, so the sheet's max-height
                would be resolved by overflowing rather than by scrolling. */}
            <ul className="divide-outline-soft min-h-0 flex-1 touch-pan-y divide-y overflow-y-auto overscroll-contain px-1">
              {entries.map((entry) => {
                const country = getCountry(entry.country);
                const shown = readableRate(entry.rate, entry.from, entry.to);
                const amount = parseAmount(entry.amount) ?? 0;
                return (
                  <li key={entry.at} className="flex items-center gap-0.5 py-0.5">
                    {/* The row is the reuse target — one large button, because
                        reuse is why the list exists. Delete keeps its own 44px
                        target beside it rather than hiding inside this one. */}
                    <button
                      type="button"
                      onClick={() => onReuse(entry)}
                      className={cn(
                        'min-h-touch flex min-w-0 flex-1 items-center gap-1 rounded-lg px-1 text-left',
                        'duration-fast transition-colors ease-out',
                        // `sunken`, not `hover`: the 12px secondary line is
                        // `fg-muted`, which measures 4.42:1 on `hover` and
                        // 4.97:1 here. A hover state may not drop a row below AA.
                        'hover:bg-sunken active:scale-[0.99] motion-reduce:active:scale-100',
                      )}
                    >
                      {country && <Flag emoji={country.flag} code={country.code} />}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="tabular text-fg truncate text-sm font-medium">
                          {formatCurrency(amount, entry.from, locale)} →{' '}
                          {formatCurrency(entry.result, entry.to, locale)}
                        </span>
                        <span className="tabular text-fg-muted truncate text-xs">
                          {when.format(new Date(entry.at))} · 1 {shown.from} ={' '}
                          {formatRate(shown.rate, locale)} {shown.to}
                          {entry.variantId && t.has(`variant.${entry.variantId}`)
                            ? ` · ${t(`variant.${entry.variantId}`)}`
                            : ''}
                        </span>
                      </span>
                    </button>

                    <IconButton
                      label={t('remove', { amount: formatCurrency(amount, entry.from, locale) })}
                      variant="ghost"
                      onClick={() => onRemove(entry.at)}
                    >
                      <svg className="size-2" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                        />
                      </svg>
                    </IconButton>
                  </li>
                );
              })}
            </ul>

            <div className="px-2 pt-1">
              <button
                type="button"
                onClick={onClear}
                className={cn(
                  'min-h-touch text-danger-600 w-full rounded-lg text-sm font-medium',
                  // Inverted on hover rather than tinted. Red text needs a light
                  // background to clear AA — measured, #dc2626 falls to 4.42:1
                  // on `hover` and 4.41:1 on `sunken` — so the fill takes the
                  // colour and the text goes white, which reads at 4.83:1 and
                  // says "destructive" more plainly than a grey wash.
                  'hover:bg-danger-600 hover:text-white',
                  'duration-fast transition-colors ease-out',
                )}
              >
                {t('clearAll')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
