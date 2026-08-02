'use client';

import { useEffect } from 'react';

import { FEATURES } from '@/config';

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
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
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
