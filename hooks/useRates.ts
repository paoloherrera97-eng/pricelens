'use client';

import { useCallback, useEffect, useState } from 'react';

import type { RateSnapshot } from '@/services/rates/types';

export type RatesState =
  | { readonly status: 'loading'; readonly snapshot: null }
  | { readonly status: 'ready'; readonly snapshot: RateSnapshot }
  | { readonly status: 'error'; readonly snapshot: null };

/**
 * Fetches the rate table once per session (ADR-001).
 *
 * Deliberately hand-written rather than SWR/React Query: one request, once, is
 * not worth a permanent dependency (ADR-003).
 *
 * Offline continuity is not handled here — the service worker replays the last
 * table the user genuinely received, so this hook simply sees a successful
 * response (ADR-007, ADR-013).
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

        if (!cancelled) setState({ status: 'ready', snapshot });
      } catch {
        // Nothing actionable to show the user beyond "try again", so the
        // detail stays server-side.
        if (!cancelled) setState({ status: 'error', snapshot: null });
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
