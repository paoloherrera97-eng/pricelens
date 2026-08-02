import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * A loading placeholder that occupies the exact dimensions of the content it
 * stands in for.
 *
 * Sized by the caller rather than by a variant, because the whole point is to
 * match a specific piece of content and prevent the layout shift that a spinner
 * would cause when the real content arrives.
 *
 * The pulse is suppressed under `prefers-reduced-motion` by the global rule in
 * `globals.css`.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      // Decorative: the surrounding region announces the loading state, so a
      // screen reader should not also read a row of empty boxes.
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-neutral-100', className)}
      {...props}
    />
  );
}
