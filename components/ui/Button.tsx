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
  // `bg-primary-600` is the raw palette value in both themes: white on it
  // measures 5.17:1 either way, so the fill does not need to change.
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-700',
  secondary: 'bg-sunken text-fg hover:bg-hover active:bg-hover',
  ghost: 'bg-transparent text-fg-muted hover:bg-sunken hover:text-fg active:bg-hover',
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
        // `active:scale` is the whole press interaction: 120ms, 1% travel. It
        // reads as the surface accepting the tap rather than as an animation.
        'duration-fast transition-[background-color,box-shadow,transform] ease-out',
        'active:scale-[0.98] motion-reduce:active:scale-100',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        isFullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {/* The label keeps its space while loading, so the button cannot resize
          under the user's finger mid-tap.

          `opacity-0`, NOT `invisible`: `visibility: hidden` removes the element
          from the accessibility tree, so a loading button would lose its name
          entirely. Caught by an axe audit — a jsdom unit test cannot see this,
          because Tailwind's CSS is never applied there. */}
      <span className={cn(isLoading && 'opacity-0')}>{children}</span>
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
