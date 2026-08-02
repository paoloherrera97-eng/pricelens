import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui';

/**
 * The single screen.
 *
 * Phases 2–3 establish the shell — the layout, the card surface, and the
 * responsive rhythm the converter will live in. The converter itself is built
 * in Phase 4; this is its frame, not a mock of it.
 */
export default async function HomePage() {
  const t = await getTranslations('app');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-2 py-4 md:px-4">
      <main className="w-full max-w-md">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{t('name')}</h1>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{t('tagline')}</p>
        </header>

        <Card aria-labelledby="converter-heading">
          <h2 id="converter-heading" className="sr-only">
            {t('name')}
          </h2>
          <div className="min-h-20" />
        </Card>
      </main>
    </div>
  );
}
