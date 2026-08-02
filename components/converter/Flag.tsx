'use client';

import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * A country flag, with an honest fallback.
 *
 * Emoji flags render beautifully on iOS, Android and macOS — our primary
 * targets — and are free: no image requests, no sprite sheet, no dependency,
 * and they scale with the type. **Windows ships no flag glyphs at all**, and
 * renders the regional-indicator pair as two bare letters, which looks like a
 * rendering bug rather than a design.
 *
 * So we detect support once and, where it is missing, show a deliberate
 * two-letter code chip instead. The result reads as intentional on every
 * platform, still with no assets to download.
 */

let cachedSupport: boolean | null = null;

function detectFlagSupport(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  if (typeof document === 'undefined') return true;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const context = canvas.getContext('2d');
    if (!context) return (cachedSupport = true);

    context.font = '16px sans-serif';
    // A supported flag renders as one glyph, and is measurably narrower than
    // the two letter-boxes an unsupported platform draws in its place.
    const flag = context.measureText('\u{1F1EA}\u{1F1F8}').width;
    const letters = context.measureText('ES').width;
    return (cachedSupport = flag < letters * 1.5);
  } catch {
    return (cachedSupport = true);
  }
}

// Detection depends on the document, so it is read through an external-store
// subscription: the server renders the emoji, and a platform without flag
// support corrects itself on hydration.
const subscribe = () => () => {};

export interface FlagProps {
  /** The emoji flag, from the country record. */
  emoji: string;
  /** ISO 3166-1 alpha-2 code, used for the fallback chip. */
  code: string;
  className?: string;
}

export function Flag({ emoji, code, className }: FlagProps) {
  const supportsFlags = useSyncExternalStore(
    subscribe,
    detectFlagSupport,
    () => true, // server: assume support, correct after hydration
  );

  if (!supportsFlags) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'bg-hover inline-flex h-3 min-w-5 items-center justify-center rounded px-0.5',
          'text-fg-muted text-[0.625rem] leading-none font-semibold tracking-wide',
          className,
        )}
      >
        {code}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={cn('text-lg leading-none', className)}>
      {emoji}
    </span>
  );
}
