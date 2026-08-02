'use client';

import { useTranslations } from 'next-intl';

import { IconButton } from '@/components/ui';

export interface FavouriteToggleProps {
  /** Whether the pair on screen is already saved. */
  isSaved: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * The star.
 *
 * One control for both directions, because "save this" and "unsave this" are
 * the same thought and a second button would only ever be half-relevant. The
 * fill carries the state; the accessible name changes with it, so a screen
 * reader is told what the tap will *do* rather than what the icon looks like.
 *
 * `aria-pressed` as well: the star is a toggle, and assistive technology should
 * be able to report its state without reading the label twice.
 */
export function FavouriteToggle({ isSaved, onToggle, className }: FavouriteToggleProps) {
  const t = useTranslations('favourites');

  return (
    <IconButton
      label={isSaved ? t('remove') : t('add')}
      aria-pressed={isSaved}
      variant="ghost"
      onClick={onToggle}
      className={className}
    >
      <svg
        className={isSaved ? 'text-accent size-2.5' : 'size-2.5'}
        viewBox="0 0 24 24"
        // Filled when saved, outlined when not: the difference is visible at a
        // glance and does not rely on colour alone (WCAG 1.4.1).
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85z" />
      </svg>
    </IconButton>
  );
}
