import type { MetadataRoute } from 'next';

import { APP_CONFIG, DEFAULT_LOCALE } from '@/config';
import messages from '@/messages/es.json';

/**
 * PWA manifest.
 *
 * Generated from config and message data rather than a static file, so the app
 * name and description cannot drift from what the UI says.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} — ${messages.app.tagline}`,
    short_name: APP_CONFIG.name,
    description: messages.app.description,
    lang: DEFAULT_LOCALE,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    categories: ['travel', 'finance', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Padded so platform-applied masks cannot crop the mark.
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
