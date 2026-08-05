'use client';

import { useCallback, useMemo } from 'react';

import { APP_CONFIG } from '@/config';
import {
  addHistoryEntry,
  parseHistory,
  removeHistoryEntry,
  serialiseHistory,
  type HistoryEntry,
  type NewHistoryEntry,
} from '@/lib/history/history';

import { useLocalStorage } from './useLocalStorage';

const EMPTY: readonly HistoryEntry[] = [];

export interface UseHistory {
  readonly history: readonly HistoryEntry[];
  /** Records a conversion. A repeat of the newest entry refreshes it in place. */
  readonly record: (entry: NewHistoryEntry) => void;
  readonly remove: (at: string) => void;
  readonly clear: () => void;
}

/**
 * Conversion history, persisted.
 *
 * All of the thinking lives in `lib/history` — this only binds it to storage,
 * so the rules can be tested without a DOM. It rides on the same
 * `useLocalStorage` as favourites and the home currency, which brings cross-tab
 * updates and the private-mode fallback along for free.
 */
export function useHistory(): UseHistory {
  const [history, setHistory] = useLocalStorage<readonly HistoryEntry[]>(
    APP_CONFIG.storageKeys.history,
    EMPTY,
    parseHistory,
    serialiseHistory,
  );

  const record = useCallback(
    (entry: NewHistoryEntry) => {
      setHistory(addHistoryEntry(history, entry, new Date().toISOString()));
    },
    [history, setHistory],
  );

  const remove = useCallback(
    (at: string) => setHistory(removeHistoryEntry(history, at)),
    [history, setHistory],
  );

  const clear = useCallback(() => setHistory(EMPTY), [setHistory]);

  return useMemo(() => ({ history, record, remove, clear }), [history, record, remove, clear]);
}
