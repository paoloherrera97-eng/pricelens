import { getTranslations } from 'next-intl/server';

import { Converter } from '@/components/converter/Converter';

/**
 * The single screen.
 *
 * A Server Component holding the static shell, so the only JavaScript the
 * browser downloads is the converter itself.
 */
export default async function HomePage() {
  const t = await getTranslations('app');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-2 py-2 md:px-4 md:py-4">
      <main className="w-full max-w-md">
        <header className="mb-2 text-center md:mb-3">
          <h1 className="text-fg text-2xl font-semibold tracking-tight">{t('name')}</h1>
          <p className="text-fg-muted mt-1 text-sm leading-relaxed">{t('tagline')}</p>
        </header>

        <Converter />
      </main>
    </div>
  );
}
