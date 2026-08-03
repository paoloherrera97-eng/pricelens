'use client';

import { useCallback } from 'react';

import { APP_CONFIG } from '@/config';
import { parseSelection, serialiseSelection, type VariantSelection } from '@/lib/rates/variants';

import { useLocalStorage } from './useLocalStorage';

const EMPTY: VariantSelection = {};

export interface UseRateVariant {
  readonly selection: VariantSelection;
  readonly select: (currency: string, variantId: string) => void;
}

/**
 * Which quotation the traveler picked, per currency, remembered between visits.
 *
 * Stored as a map rather than a single value so the mechanism generalises: the
 * day a second currency gains parallel rates, nothing here changes. It is the
 * same kind of value ADR-005 already permits — a preference the user chose, no
 * amounts and no timestamps (ADR-018).
 */
export function useRateVariant(): UseRateVariant {
  const [selection, setSelection] = useLocalStorage<VariantSelection>(
    APP_CONFIG.storageKeys.rateVariants,
    EMPTY,
    parseSelection,
    serialiseSelection,
  );

  const select = useCallback(
    (currency: string, variantId: string) => {
      setSelection({ ...selection, [currency]: variantId });
    },
    [selection, setSelection],
  );

  return { selection, select };
}
