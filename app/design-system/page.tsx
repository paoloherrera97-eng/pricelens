import type { Metadata } from 'next';

import { DesignSystemGallery } from './DesignSystemGallery';

/**
 * Internal design-system reference.
 *
 * Every primitive in every state, on one page. It exists so that a visual
 * regression is visible in one place rather than discovered in the product, and
 * so a reviewer can see the system without reading JSX.
 *
 * Not linked from the app and not indexable — it is a team tool, not a page.
 */
export const metadata: Metadata = {
  title: 'Sistema de diseño',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemGallery />;
}
