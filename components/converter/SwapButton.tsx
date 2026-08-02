'use client';

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
 */
export function SwapButton({ onSwap }: SwapButtonProps) {
  const t = useTranslations('converter');

  return (
    <IconButton
      label={t('swap')}
      variant="solid"
      onClick={onSwap}
      // Subtle, and only on the icon: motion here confirms the tap registered
      // and then gets out of the way.
      className="duration-base transition-transform ease-out active:rotate-180"
    >
      <svg className="size-2.5" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconButton>
  );
}
