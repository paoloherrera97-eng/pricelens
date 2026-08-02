import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { APP_CONFIG, SITE, SPLASH_SCREENS } from '@/config';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');

  const title = `${APP_CONFIG.name} — ${t('tagline')}`;
  const description = t('description');

  return {
    // Resolves every relative URL below (canonical, OG image) against the
    // production origin — see config/site.ts for how that origin is derived.
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s · ${APP_CONFIG.name}`,
    },
    description,
    applicationName: APP_CONFIG.name,
    // A single-screen app has exactly one canonical URL. Stating it stops
    // preview deployments and any query-string variant from competing with
    // production in search results.
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: APP_CONFIG.name,
      locale: SITE.ogLocale,
      url: '/',
      title,
      description,
      images: [
        {
          url: SITE.ogImage,
          width: SITE.ogImageWidth,
          height: SITE.ogImageHeight,
          alt: `${APP_CONFIG.name} — ฿1.890 → 49,12 €`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE.ogImage],
    },
    keywords: [
      'conversor de divisas',
      'cambio de moneda',
      'precios en el extranjero',
      'viajes',
      'tipo de cambio',
    ],
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      // iOS looks for this by convention at `/apple-touch-icon.png`, which is
      // not where ours lives — without the link it silently falls back to a
      // screenshot of the page as the home-screen icon.
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      // Launch screens. Generated, one per device resolution, because iOS
      // matches them on exact CSS dimensions and pixel ratio — see
      // scripts/generate-splash.mjs.
      other: SPLASH_SCREENS.map(({ url, media }) => ({
        rel: 'apple-touch-startup-image',
        url,
        media,
      })),
    },
    // Lets iOS treat the installed app as standalone.
    appleWebApp: {
      capable: true,
      title: APP_CONFIG.name,
      statusBarStyle: 'default',
    },
    formatDetection: {
      // Long numbers must not be linkified as phone numbers on iOS.
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  // Per-scheme, so the browser chrome follows the theme instead of staying
  // brand blue in dark mode. These are the resolved values of --pl-bg in each
  // theme (app/globals.css); Safari tints its toolbar with them.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e16' },
  ],
  width: 'device-width',
  initialScale: 1,
  // The picker opens as a bottom sheet and focuses its search field, which
  // raises the on-screen keyboard. By default the keyboard overlays the layout
  // viewport, so `dvh` keeps reporting the full screen height and the sheet
  // sizes itself partly underneath the keyboard — leaving a sliver of list that
  // is awkward to scroll. `resizes-content` shrinks the layout viewport
  // instead, so `70dvh` means 70% of what the user can actually see.
  interactiveWidget: 'resizes-content',
  // Never block pinch-zoom: capping it fails WCAG 2.2 and hurts exactly the
  // users who need it most (DESIGN_SYSTEM.md §8).
  maximumScale: 5,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>
          {children}
          <ServiceWorkerRegistrar />
          {/* Vercel Web Analytics — aggregate page views, cookieless, served
              first-party from /_vercel/insights. Renders nothing. */}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
