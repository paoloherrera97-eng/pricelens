'use client';

import { useEffect, useRef } from 'react';

import { APP_CONFIG, FEATURES, type CurrencyCode } from '@/config';
import { detectHomeCurrency, readSignals } from '@/lib/geo/detect';

import { readStoredValue } from './useLocalStorage';

/**
 * Picks a home currency for a first-time visitor.
 *
 * Three properties matter more than the detection itself:
 *
 * - **It runs once, on a first visit only.** A stored home currency — whether
 *   the user chose it or a previous visit detected it — is never overridden.
 *   Re-detecting would fight anyone who deliberately picked something else,
 *   which is the failure mode that makes this kind of feature hated.
 * - **It never blocks.** The effect runs after paint and applies its result
 *   whenever it arrives. A user who has already started typing sees their own
 *   choice win, because `apply` routes through the same handler as the picker.
 * - **It cannot make things worse.** Detection returning null, throwing, or
 *   naming a currency we have no rate for all leave the configured default
 *   exactly where it was.
 */
export function useDetectedHomeCurrency(apply: (currency: CurrencyCode) => void): void {
  // `apply` is a callback from a component and changes identity as its
  // dependencies do; without this the effect would re-run and re-detect.
  const hasRun = useRef(false);
  const applyRef = useRef(apply);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (hasRun.current) return;
    if (!FEATURES.detectHomeCurrency) return;
    // Someone has been here before. Their currency is not ours to change.
    if (readStoredValue(APP_CONFIG.storageKeys.homeCurrency) !== null) return;

    hasRun.current = true;
    let cancelled = false;

    void detectHomeCurrency(readSignals())
      .then((currency) => {
        if (!cancelled && currency) applyRef.current(currency);
      })
      .catch(() => {
        // A failed guess is not an error worth showing anyone: the default is
        // still a working app.
      });

    return () => {
      cancelled = true;
    };
  }, []);
}
