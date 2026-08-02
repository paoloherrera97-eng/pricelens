import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export type IconButtonVariant = 'solid' | 'subtle' | 'ghost';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Required. An icon-only control is unusable with a screen reader without it,
   * so the type system asks for it rather than trusting anyone to remember.
   */
  label: string;
  variant?: IconButtonVariant;
  children: ReactNode;
}

const VARIANTS: Record<IconButtonVariant, string> = {
  solid: 'bg-primary-600 text-white shadow-md hover:bg-primary-700',
  subtle:
    'bg-surface text-fg-muted shadow-sm ring-1 ring-outline-soft hover:bg-sunken hover:text-fg',
  ghost: 'bg-transparent text-fg-muted hover:bg-sunken hover:text-fg',
};

/**
 * A square, icon-only control.
 *
 * This is the seam for future capture features: a camera trigger is an
 * `IconButton` in the input row or the thumb zone, needing no new component and
 * no layout change (ADR-010, ADR-012).
 */
export function IconButton({
  label,
  variant = 'subtle',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'size-touch inline-flex shrink-0 items-center justify-center rounded-full',
        'duration-fast transition-[background-color,color,box-shadow,transform] ease-out',
        'active:scale-95 motion-reduce:active:scale-100',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {/* Icons are decoration; the accessible name comes from `label`. */}
      <span aria-hidden="true" className="flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
