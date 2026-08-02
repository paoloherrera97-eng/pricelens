'use client';

import { useCallback, useMemo } from 'react';

import { APP_CONFIG } from '@/config';
import {
  parseFavourites,
  serialiseFavourites,
  toggleFavourite,
  type Favourite,
} from '@/lib/favourites/favourites';

import { useLocalStorage } from './useLocalStorage';

const EMPTY: readonly Favourite[] = [];

export interface UseFavourites {
  readonly favourites: readonly Favourite[];
  /** Saves the pair, or takes it back if it is already saved. */
  readonly toggle: (favourite: Favourite) => void;
}

/**
 * Favourite pairs, persisted.
 *
 * All of the thinking lives in `lib/favourites` — this only binds it to
 * storage, so the rules can be tested without a DOM and the hook has nothing
 * left to get wrong. It rides on the same `useLocalStorage` as the home
 * currency, which means cross-tab updates and the private-mode fallback come
 * along for free.
 */
export function useFavourites(): UseFavourites {
  const [favourites, setFavourites] = useLocalStorage<readonly Favourite[]>(
    APP_CONFIG.storageKeys.favourites,
    EMPTY,
    parseFavourites,
    serialiseFavourites,
  );

  const toggle = useCallback(
    (favourite: Favourite) => {
      setFavourites(toggleFavourite(favourites, favourite));
    },
    [favourites, setFavourites],
  );

  return useMemo(() => ({ favourites, toggle }), [favourites, toggle]);
}
