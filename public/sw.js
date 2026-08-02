/**
 * PriceLens service worker.
 *
 * Runtime caching only — no build-time precache manifest, and therefore no
 * coupling to the bundler (ADR-007). Assets are cached as they are used, which
 * works regardless of how the build hashes filenames.
 *
 * Three strategies, one per kind of request:
 *   - navigations   network-first, falling back to the cached shell (offline)
 *   - /api/rates    network-first, falling back to the last good rates
 *   - static assets stale-while-revalidate (immutable, hashed)
 *
 * CACHE VERSIONING
 *
 * The version comes from the `?v=` parameter the page registers this worker
 * with, which carries the build id. That matters: with a hardcoded version, a
 * deploy never retired the previous caches, so a device could keep serving the
 * assets of an older build indefinitely — a user would see stale UI while
 * believing they were on the current release. A changing version means the
 * `activate` handler below deletes every cache that is not in the current set.
 */

const CACHE_VERSION = new URL(self.location.href).searchParams.get('v') || 'v1';
const SHELL_CACHE = `pricelens-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `pricelens-assets-${CACHE_VERSION}`;
const DATA_CACHE = `pricelens-data-${CACHE_VERSION}`;
const CURRENT_CACHES = new Set([SHELL_CACHE, ASSET_CACHE, DATA_CACHE]);

const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  // Warm the shell so the very first offline navigation has something to show.
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .catch(() => {
        // A failed warm-up must not block installation; runtime caching will
        // pick the shell up on first successful navigation.
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.has(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Network-first: fresh when possible, cached when not. */
async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await caches.match(fallbackUrl);
      if (shell) return shell;
    }
    throw error;
  }
}

/** Stale-while-revalidate: serve instantly, refresh in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached ?? (await network) ?? Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch non-GET traffic or other origins.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, OFFLINE_URL));
    return;
  }

  if (url.pathname.startsWith('/api/rates')) {
    // Falling back to the last good table is what lets a traveler keep
    // converting after the connection drops (PRD E11).
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});

// Lets a future update prompt activate a waiting worker without a reload.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
