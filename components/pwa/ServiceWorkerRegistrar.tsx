'use client';

import { useEffect } from 'react';

import { FEATURES } from '@/config';

/** Inlined at build time — see next.config.ts. */
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev';

/**
 * Registers the service worker.
 *
 * Renders nothing. Registration is deliberately deferred to `load` so it never
 * competes with the first paint — the 3-second promise is measured on first
 * visit, when the service worker cannot help yet anyway.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!FEATURES.pwa) return;
    if (!('serviceWorker' in navigator)) return;
    // A worker registered from `next dev` would cache development assets and
    // then serve them after a rebuild, which looks exactly like a broken app.
    if (process.env.NODE_ENV !== 'production') return;

    const register = () => {
      // The build id rides along in the query string so a new deploy installs a
      // new worker and purges the previous build's caches. Without it a device
      // could stay pinned to stale assets across releases.
      const url = `/sw.js?v=${encodeURIComponent(BUILD_ID)}`;
      void navigator.serviceWorker.register(url, { scope: '/' }).catch(() => {
        // Registration failing costs offline support, not the app. Nothing the
        // user could act on, so nothing is shown.
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
