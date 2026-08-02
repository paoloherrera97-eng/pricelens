'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Required — a placeholder is never a label. */
  label: string;
  /** Hides the label visually while keeping it for assistive tech. */
  isLabelHidden?: boolean;
  /** Fixed content before the field, e.g. a currency symbol. */
  leading?: ReactNode;
  /**
   * Interactive content after the field.
   *
   * This is the seam for camera capture: an `IconButton` dropped here sits in
   * the input row without changing the layout or this component (ADR-012).
   */
  trailing?: ReactNode;
  /** Rendered below the field and wired up via `aria-describedby`. */
  hint?: string;
  /** Large, tabular presentation for the amount field. */
  isEmphasised?: boolean;
}

export function Input({
  label,
  isLabelHidden = false,
  leading,
  trailing,
  hint,
  isEmphasised = false,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={cn(
          'mb-0.5 block text-sm font-medium text-neutral-500',
          isLabelHidden && 'sr-only',
        )}
      >
        {label}
      </label>

      {/* focus-within moves the ring to the whole row, so the field reads as one
          control even though the trailing slot holds a separate button. */}
      <div
        className={cn(
          // The hairline is what identifies this as a control (WCAG 1.4.11);
          // the fill alone is 1.09:1 against the card.
          'ring-outline flex items-center gap-1 rounded-md bg-neutral-100 px-2 ring-1',
          'duration-fast transition-colors ease-out',
          'focus-within:outline-primary-500 focus-within:outline-2 focus-within:outline-offset-2',
          isEmphasised ? 'min-h-touch-lg' : 'min-h-touch',
        )}
      >
        {leading && (
          <span aria-hidden="true" className="shrink-0 text-neutral-500">
            {leading}
          </span>
        )}

        <input
          id={inputId}
          aria-describedby={hint ? hintId : undefined}
          className={cn(
            // `self-stretch` makes the field fill the row's full height, so the
            // tappable area is the whole 44px row rather than the ~40px the text
            // line happens to occupy. Verified in-browser; without it the input
            // measures 40px and misses the WCAG target-size floor.
            'min-w-0 flex-1 self-stretch bg-transparent text-neutral-900 outline-none',
            'placeholder:text-neutral-500',
            // 1rem minimum: anything smaller triggers iOS Safari's zoom-on-focus,
            // which throws the user out of the layout mid-tap.
            isEmphasised ? 'tabular text-lg font-medium' : 'text-base',
            className,
          )}
          {...props}
        />

        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>

      {hint && (
        <p id={hintId} className="mt-0.5 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}
