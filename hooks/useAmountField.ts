'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, type ChangeEvent } from 'react';

import { amountSeparators, formatAmountValue, nextAmountEdit } from '@/lib/currency/amountInput';

export interface UseAmountField {
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Formats a value that did not come from typing — a shared link, say. */
  readonly format: (raw: string) => string;
}

/**
 * Binds the live-formatting rules to a real input element.
 *
 * All the thinking is in `lib/currency/amountInput`, which is pure and tested
 * without a DOM. What is left here is the one thing that genuinely needs the
 * element: putting the caret back.
 *
 * **Why a layout effect.** A controlled input's value is replaced wholesale on
 * re-render, which sends the caret to the end. Restoring it in `useLayoutEffect`
 * lands the correction before the browser paints, so the caret never visibly
 * moves — `useEffect` would let one frame through with it in the wrong place.
 */
export function useAmountField(
  value: string,
  onValueChange: (next: string) => void,
  locale: string,
): UseAmountField {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const separators = useMemo(() => amountSeparators(locale), [locale]);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    caretRef.current = null;
    if (caret === null || !inputRef.current) return;
    inputRef.current.setSelectionRange(caret, caret);
  });

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const element = event.target;
      const caret = element.selectionStart ?? element.value.length;
      const edit = nextAmountEdit(value, element.value, caret, locale, separators);

      if (edit.text === value) {
        // React re-renders nothing when the state is unchanged, so the layout
        // effect never runs and the browser keeps whatever the user typed —
        // a rejected character would stay on screen. Undo it here instead.
        element.value = value;
        element.setSelectionRange(edit.caret, edit.caret);
        return;
      }

      caretRef.current = edit.caret;
      onValueChange(edit.text);
    },
    [locale, onValueChange, separators, value],
  );

  const format = useCallback(
    (raw: string) => formatAmountValue(raw, locale, separators),
    [locale, separators],
  );

  return { inputRef, onChange, format };
}
