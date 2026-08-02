import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { APP_CONFIG } from '@/config';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');

  return {
    title: {
      default: `${APP_CONFIG.name} — ${t('tagline')}`,
      template: `%s · ${APP_CONFIG.name}`,
    },
    description: t('description'),
    applicationName: APP_CONFIG.name,
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
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
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
