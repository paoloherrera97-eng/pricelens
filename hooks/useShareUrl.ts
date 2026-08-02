'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { buildShareQuery, buildShareUrl, type ShareState } from '@/lib/share/url';

/** These values never change, so nothing ever needs to notify. */
const subscribeNever = () => () => {};

/** How long to wait before rewriting the address bar while typing. */
const SYNC_DELAY_MS = 400;

/**
 * Keeps the address bar in step with the conversion, and hands back a link.
 *
 * Two deliberate choices:
 *
 * - **`history.replaceState`, not the router.** A router navigation would
 *   re-render the tree on every keystroke for a change that affects nothing but
 *   the address bar. `replaceState` is a native, synchronous write that React
 *   never sees.
 * - **Replace, not push.** Pushing would make the back button walk backwards
 *   through every amount the user typed, which is not history anyone wants.
 *
 * The write is debounced so a fast typist produces one update rather than ten,
 * and skipped entirely when the query has not actually changed.
 */
export function useShareUrl(state: ShareState): string {
  const query = useMemo(() => buildShareQuery(state), [state]);
  const lastQuery = useRef<string | null>(null);

  // The origin is only knowable in the browser, and it never changes — so this
  // is a store with no subscription, read through the same API the storage hook
  // uses. The server snapshot is empty, which leaves the share control disabled
  // for the one frame before hydration rather than offering a broken URL.
  const origin = useSyncExternalStore(
    subscribeNever,
    () => window.location.origin,
    () => '',
  );

  useEffect(() => {
    if (lastQuery.current === query) return;

    const timer = window.setTimeout(() => {
      lastQuery.current = query;
      window.history.replaceState(window.history.state, '', `${window.location.pathname}?${query}`);
    }, SYNC_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  return origin ? buildShareUrl(origin, state) : '';
}
