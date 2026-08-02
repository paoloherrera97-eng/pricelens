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
    <div className="flex min-h-dvh flex-col items-center justify-center px-2 py-1 md:px-4 md:py-4">
      <main className="w-full max-w-md">
        <header className="mb-0.5 text-center md:mb-3">
          <h1 className="text-fg text-2xl font-semibold tracking-tight">{t('name')}</h1>
          {/* Oculto en teléfonos: cuesta 51px de los ~553 que deja Safari con la
              barra expandida, y ahí el resultado —la promesa del producto— vale
              más que una frase explicativa. El texto sigue siendo la meta
              description, así que el SEO no depende de que se pinte, y a partir
              de `sm` hay sitio de sobra para mostrarlo. */}
          <p className="text-fg-muted mt-1 hidden text-sm leading-relaxed sm:block">
            {t('tagline')}
          </p>
        </header>

        <Converter />
      </main>
    </div>
  );
}
