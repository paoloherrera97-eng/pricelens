'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Same-tab subscribers. The native `storage` event only fires in *other* tabs,
 * so writes made here have to notify locally.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * Session-only fallback used when storage is unavailable (private mode, disabled
 * storage, blocked origin). Without it, a failed write would leave `readRaw`
 * returning the old value and the user's choice would silently not apply —
 * degrading persistence must never degrade the app (PRD E13).
 */
const sessionFallback = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return stored;
  } catch {
    // Fall through to the session value.
  }
  return sessionFallback.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    sessionFallback.delete(key);
  } catch {
    sessionFallback.set(key, value);
  }
}

/**
 * Reads a stored value without subscribing to it.
 *
 * For the one question the hook cannot answer: *has the user ever chosen?* The
 * hook collapses "absent" and "present but equal to the default" into the same
 * value, which is right for rendering and wrong for deciding whether a first
 * visit should be given a detected default. Shares `readRaw`, so the private-mode
 * fallback applies here too.
 */
export function readStoredValue(key: string): string | null {
  return readRaw(key);
}

/**
 * State backed by `localStorage`, safe under server rendering.
 *
 * Built on `useSyncExternalStore` rather than an effect that calls `setState`:
 * storage *is* an external store, and this is the API React provides for
 * reading one without tearing. It gives correct SSR behaviour via the server
 * snapshot, and cross-tab synchronisation falls out for free.
 *
 * A corrupt or no-longer-valid stored value falls back to `initialValue`
 * instead of poisoning the UI.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parse: (raw: string) => T | null,
  serialise: (value: T) => string = String,
): readonly [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    // The server has no storage; rendering the default keeps markup identical
    // on both sides, and the stored value arrives one frame later.
    () => null,
  );

  const value = useMemo(() => {
    if (raw === null) return initialValue;
    return parse(raw) ?? initialValue;
    // `parse` is intentionally excluded: callers pass inline functions, so
    // including it would recompute on every render for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, initialValue]);

  const update = useCallback(
    (next: T) => {
      writeRaw(key, serialise(next));
      notify();
    },
    [key, serialise],
  );

  return [value, update] as const;
}
