import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * The primary surface.
 *
 * Depth comes from a single soft shadow and generous padding rather than
 * borders — the elevation scale exists so surfaces never stack shadows to
 * compete for attention.
 */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // A hairline in addition to the shadow: on a dark theme the shadow
        // alone cannot separate the card from the page behind it.
        'bg-surface ring-outline-soft rounded-2xl p-3 shadow-md ring-1 md:p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
