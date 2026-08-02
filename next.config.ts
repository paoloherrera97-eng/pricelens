import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    // Identifies the build to the service worker, so a deploy retires the
    // previous build's caches instead of leaving devices on stale assets.
    // Vercel supplies the commit SHA; locally the build time is enough.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? String(Date.now()),
  },
  // Never let a type error slip into a build. (Next 16 dropped the built-in
  // `eslint` key along with `next lint`; linting is its own CI gate.)
  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [
      {
        // The worker must be re-checked on every load, or a stale worker can
        // pin users to an old build indefinitely.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
