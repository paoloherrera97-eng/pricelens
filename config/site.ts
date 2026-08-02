/**
 * The site's public identity.
 *
 * Canonical URLs, the sitemap, and Open Graph tags all need an absolute origin,
 * and hardcoding one would break the moment the app moves to a custom domain.
 * It is resolved instead, in order of specificity:
 *
 *   1. `NEXT_PUBLIC_SITE_URL` — set this when a custom domain lands
 *      (`https://pricelens.app`). Nothing else needs to change.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — set automatically by Vercel, and always
 *      the *production* hostname even when a preview build reads it. That is
 *      what we want: previews must not advertise themselves as canonical, or
 *      search engines index a throwaway URL.
 *   3. localhost, for development.
 *
 * Step 2 is why deployment still needs zero configuration (see DEPLOYMENT.md).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

export const SITE = {
  url: resolveSiteUrl(),
  /** Shown as the site name in link previews. */
  name: 'PriceLens',
  /** 1200×630, the size every major platform crops from. */
  ogImage: '/og.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  /** BCP 47 tag for `og:locale`. */
  ogLocale: 'es_ES',
} as const;
