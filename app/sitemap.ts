import type { MetadataRoute } from 'next';

import { SITE } from '@/config';

/**
 * `sitemap.xml`.
 *
 * One entry, because the product is one screen — and a sitemap that honestly
 * lists one URL is more useful to a crawler than one padded with routes that do
 * not exist. `/design-system` is deliberately absent: it is disallowed in
 * `robots.ts` and is not part of the product.
 *
 * `lastModified` is the build time, which for a static export is exactly when
 * the page's content last changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.url}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
