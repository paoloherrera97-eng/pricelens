import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE } from '@/config';

/**
 * next-intl request configuration.
 *
 * The MVP has one locale, so there is no locale routing and no middleware: the
 * locale resolves to the default. When a second locale arrives, this is where
 * negotiation (header, cookie, or URL segment) is added — call sites do not
 * change (ADR-009).
 */
export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: 'UTC',
    onError(error) {
      // A missing message is a bug worth surfacing in development, but it is
      // never a reason to fail a render in production.
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
    },
    getMessageFallback({ key }) {
      return key;
    },
  };
});
