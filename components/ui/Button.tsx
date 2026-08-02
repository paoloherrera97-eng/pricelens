import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a spinner and blocks interaction without changing the button's width. */
  isLoading?: boolean;
  /** Stretches to the container — the default shape for a primary action on mobile. */
  isFullWidth?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-200',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-100',
};

const SIZES: Record<ButtonSize, string> = {
  // Both sizes clear the 44px accessibility floor; `lg` is for the primary
  // action, which lives in the thumb zone.
  md: 'min-h-touch px-3 text-base',
  lg: 'min-h-touch-lg px-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      // A loading button is not "broken", it is busy — `aria-busy` says so
      // without removing it from the accessibility tree.
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center gap-1 rounded-lg font-medium',
        'duration-fast transition-colors ease-out',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        isFullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {/* The label keeps its space while loading, so the button cannot resize
          under the user's finger mid-tap. */}
      <span className={cn(isLoading && 'invisible')}>{children}</span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="size-2.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
