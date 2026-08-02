import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
