import type { MetadataRoute } from 'next';

import { SITE } from '@/config';

/**
 * `robots.txt`.
 *
 * Two deliberate exclusions:
 *
 * - `/design-system` is an internal reference page. It already carries a
 *   `noindex` meta tag, but a crawler has to fetch the page to read that;
 *   disallowing it here means the request is never made.
 * - `/api/` returns JSON with no standalone meaning, and crawling it would put
 *   pointless load on the rate provider through our proxy.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/design-system', '/api/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
