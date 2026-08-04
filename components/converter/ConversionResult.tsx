'use client';

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { Skeleton } from '@/components/ui';
import { useSettledValue } from '@/hooks/useSettledValue';
import { cn } from '@/lib/utils/cn';

/**
 * How long the amount must hold still before the result is announced.
 *
 * Long enough to cover the gap between digits of one number, short enough that
 * a screen-reader user is not left waiting for their answer.
 */
const ANNOUNCE_AFTER_MS = 600;

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

  // Announced once the typing stops, never per keystroke. The visible number
  // below is not affected — it still tracks every digit.
  const announcement = useSettledValue(
    !isLoading && converted && !isEmpty ? t('announcement', { amount: original, converted }) : '',
    ANNOUNCE_AFTER_MS,
  );

  return (
    <div className="bg-sunken ring-outline-soft rounded-xl px-2 py-2 text-center ring-1 md:py-3">
      <p className="text-fg-muted text-xs font-medium tracking-wide uppercase">
        {t('resultLabel')}
      </p>

      {/* `fit-container` makes this element the query container that sizes the
          value below; `px-1` insets that container from the card's own padding,
          which is both the comfortable gutter and the safety margin the sizing
          estimate spends if a font runs wider than measured. */}
      <div
        className={cn(
          'fit-container mt-0.5 min-h-6 px-1 md:mt-1 md:min-h-8',
          // The reserved height stops the card resizing between states; now
          // that the value's height varies with its length, the value has to be
          // centred inside that reserve or a short number floats at the top.
          'flex flex-col items-center justify-center',
        )}
      >
        {isLoading ? (
          <Skeleton className="mx-auto h-6 w-24" />
        ) : converted ? (
          <p
            key={converted}
            // Fuera del árbol de accesibilidad: la región de abajo dice lo
            // mismo y en una frase entera. Dentro, el número se anunciaba dos
            // veces seguidas — «0,92 € · 1,00 US$ equivale a 0,92 €».
            aria-hidden="true"
            // The character count is the second input to the sizing formula
            // (app/globals.css). It has to come from here because only the
            // component knows the string.
            style={{ '--len': converted.length } as CSSProperties}
            className={cn(
              'tabular text-fit sm:text-fit-lg animate-rise text-fg',
              // The empty state keeps the number in place but recedes, so the
              // layout never jumps when the first digit is typed. `fg-muted`
              // rather than `fg-subtle`: this is real text and must clear
              // 4.5:1 (fg-subtle measured 2.34:1 on the result surface).
              isEmpty && 'text-fg-muted',
            )}
          >
            {converted}
          </p>
        ) : (
          <p className="text-fg-muted px-2 py-2 text-base">{t('unavailablePair')}</p>
        )}
      </div>

      {/* La única región viva de la pantalla, y dice el resultado una sola vez.
          Está siempre montada: un contenedor `aria-live` que aparece a la vez
          que su contenido a menudo no se anuncia en absoluto.

          Sin importe se queda vacía a propósito. El valor visible es entonces
          un marcador que mantiene el alto de la tarjeta, y anunciarlo le diría
          a un lector de pantalla que «0,00 ฿ equivale a 0,00 €», una conversión
          que nadie ha pedido. */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>

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
