import type { ReactElement, ReactNode } from 'react';

import { render as rtlRender } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/messages/es.json';
import { DEFAULT_LOCALE } from '@/config';

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Renders with the real message catalogue rather than stub strings, so a test
 * that passes proves the Spanish copy actually resolves.
 */
export function render(ui: ReactElement) {
  return rtlRender(ui, { wrapper: Providers });
}

export * from '@testing-library/react';
