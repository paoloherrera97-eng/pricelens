import { getTranslations } from 'next-intl/server';

/**
 * The single screen.
 *
 * Phase 2 establishes the shell — the layout, the card container, and the
 * responsive rhythm the converter will live in. The converter itself is built
 * in Phase 4; this is its frame, not a mock of it.
 */
export default async function HomePage() {
  const t = await getTranslations('app');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 md:px-8">
      <main className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{t('name')}</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{t('tagline')}</p>
        </header>

        <section
          aria-labelledby="converter-heading"
          className="rounded-xl bg-white p-6 shadow-md md:p-8"
        >
          <h2 id="converter-heading" className="sr-only">
            {t('name')}
          </h2>
          <div className="min-h-40" />
        </section>
      </main>
    </div>
  );
}
