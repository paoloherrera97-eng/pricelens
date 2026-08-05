'use client';

import { useCallback, useEffect, useState } from 'react';

import { APP_CONFIG } from '@/config';
import { parseCachedSnapshot, serialiseSnapshot } from '@/lib/rates/cache';
import type { RateSnapshot } from '@/services/rates/types';

export type RatesState =
  | { readonly status: 'loading'; readonly snapshot: null }
  | { readonly status: 'ready'; readonly snapshot: RateSnapshot }
  | { readonly status: 'error'; readonly snapshot: null };

const KEY = APP_CONFIG.storageKeys.lastRates;

/**
 * Keeps the last table that actually arrived.
 *
 * Storage can be refused outright — private mode, a blocked origin — and a
 * refusal here must cost nothing: the app worked without this cache before it
 * existed, and it works without it now.
 */
function remember(snapshot: RateSnapshot): void {
  try {
    window.localStorage.setItem(KEY, serialiseSnapshot(snapshot));
  } catch {
    // Nothing to do and nothing to tell the user: the fetch succeeded.
  }
}

function recall(): RateSnapshot | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === null ? null : parseCachedSnapshot(raw);
  } catch {
    return null;
  }
}

/**
 * Fetches the rate table once per session (ADR-001).
 *
 * Deliberately hand-written rather than SWR/React Query: one request, once, is
 * not worth a permanent dependency (ADR-003).
 *
 * **A provider outage costs freshness, not the app.** Every table that arrives
 * is kept, and a failed fetch falls back to it with `degraded: true` so the UI
 * can say plainly that this is the last quotation available. A table from this
 * morning converts a restaurant bill perfectly well; a retry screen with no
 * controls converts nothing, and it appears exactly when the traveler is abroad
 * on a connection already failing them. The empty error state is reserved for
 * the one case that genuinely has nothing to show: a first visit that failed.
 *
 * This complements the service worker rather than duplicating it (ADR-007,
 * ADR-013): the worker replays a response when the network is unreachable,
 * where this survives a provider that answers, and answers 500.
 */
export function useRates(): RatesState & { readonly retry: () => void } {
  const [state, setState] = useState<RatesState>({ status: 'loading', snapshot: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading', snapshot: null });
      try {
        const response = await fetch('/api/rates');
        if (!response.ok) throw new Error(`rates responded ${response.status}`);

        const snapshot = (await response.json()) as RateSnapshot;
        if (!snapshot?.rates || typeof snapshot.base !== 'string') {
          throw new Error('malformed rates response');
        }

        remember(snapshot);
        if (!cancelled) setState({ status: 'ready', snapshot });
      } catch {
        // The detail stays server-side — there is nothing actionable in it for
        // the user. What they get instead is the last table that worked.
        const cached = recall();
        if (cancelled) return;
        setState(
          cached ? { status: 'ready', snapshot: cached } : { status: 'error', snapshot: null },
        );
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
