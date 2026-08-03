'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils/cn';
import type { RateVariant } from '@/types';

export interface RateVariantPickerProps {
  variants: readonly RateVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
  className?: string;
}

/**
 * Which rate the number is using — as a choice, not a footnote.
 *
 * A segmented control rather than a dropdown: there are three options, they are
 * all short, and the one in force has to be readable without opening anything.
 * A dropdown would hide the very thing this component exists to disclose.
 *
 * Only rendered when a currency actually has more than one quotation, so every
 * destination that is not Argentina looks exactly as it did before.
 *
 * `radiogroup` rather than a row of buttons: these are mutually exclusive
 * choices over one value, which is what radios mean, and it gives arrow-key
 * navigation for free.
 */
export function RateVariantPicker({
  variants,
  selectedId,
  onSelect,
  className,
}: RateVariantPickerProps) {
  const t = useTranslations('rateVariants');

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label={t('legend')}
        className="bg-sunken ring-outline-soft flex gap-0.5 rounded-lg ring-1"
      >
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              // The full name is the accessible one; the visible label is short
              // because three of them share a 390px row.
              aria-label={t(`${variant.id}.full`)}
              onClick={() => onSelect(variant.id)}
              className={cn(
                'min-h-touch m-0.5 flex-1 rounded-md px-1 text-sm font-medium',
                'duration-fast transition-colors ease-out',
                'active:scale-[0.98] motion-reduce:active:scale-100',
                isSelected
                  ? 'bg-surface text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg bg-transparent',
              )}
            >
              {t(`${variant.id}.short`)}
            </button>
          );
        })}
      </div>

      {/* «Blue» no significa nada para quien llega por primera vez, y hasta
          ahora esa explicación solo existía en el `aria-label`: el usuario con
          lector de pantalla estaba mejor informado que el que ve la pantalla.
          `aria-hidden` porque el nombre accesible del botón ya la lleva, y
          repetirla haría que se anunciase dos veces.

          `has` porque `variantsFor` conserva a propósito las cotizaciones que
          no reconoce —un «mep» que añada la fuente mañana llega hasta aquí—, y
          una cotización sin texto debe quedarse sin línea, no romper la
          pantalla. */}
      {t.has(`hint.${selectedId}`) && (
        <p aria-hidden="true" className="text-fg-muted mt-0.5 text-center text-xs">
          {t(`hint.${selectedId}`)}
        </p>
      )}
    </div>
  );
}
