'use client';

import { useEffect, useRef, useState } from 'react';

import { parseShareParams, type PartialShareState } from '@/lib/share/url';

/**
 * Applies a shared link's state, once, on arrival.
 *
 * Read in an effect rather than during render: the server has no query string,
 * so seeding state from it at render time would make the client's first pass
 * disagree with the markup it is hydrating. One frame later is invisible and
 * correct.
 *
 * Returns a ref reporting whether the link carried a home currency. Detection
 * (`useDetectedHomeCurrency`) must not overrule a link the user deliberately
 * opened — a shared price is a statement about *which* conversion to show, and
 * guessing over it would make shared links unreliable in exactly the case they
 * exist for.
 */
export function useSharedLink(apply: (state: PartialShareState) => void): {
  readonly hadHomeCurrency: boolean;
} {
  const applyRef = useRef(apply);
  // State rather than a ref, because the answer is read during render to decide
  // whether detection should run. Initialised lazily and never updated: the
  // query string a page was opened with does not change under it.
  const [shared] = useState<PartialShareState>(() =>
    typeof window === 'undefined' ? {} : parseShareParams(window.location.search),
  );

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (Object.keys(shared).length > 0) applyRef.current(shared);
  }, [shared]);

  return { hadHomeCurrency: shared.to !== undefined };
}
