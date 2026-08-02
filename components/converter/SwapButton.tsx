'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/components/ui';

export interface SwapButtonProps {
  onSwap: () => void;
}

/**
 * Reverses the conversion direction.
 *
 * One tap, no refetch, no layout shift — swapping is pure local arithmetic
 * because the rate table serves every pair (ADR-001).
 *
 * The icon rotates a further half-turn on every press rather than toggling
 * between two states, so repeated taps keep turning the same way instead of
 * snapping back. The rotation is on the icon alone: the 44px target never
 * moves under the finger.
 */
export function SwapButton({ onSwap }: SwapButtonProps) {
  const t = useTranslations('converter');
  const [turns, setTurns] = useState(0);

  const handleClick = useCallback(() => {
    setTurns((n) => n + 1);
    onSwap();
  }, [onSwap]);

  return (
    <IconButton label={t('swap')} variant="solid" onClick={handleClick}>
      <svg
        className="duration-base size-2.5 transition-transform ease-out motion-reduce:transition-none"
        style={{ transform: `rotate(${turns * 180}deg)` }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconButton>
  );
}
