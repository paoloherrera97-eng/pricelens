#!/usr/bin/env node
/**
 * Finance OS — compilador de tokens.
 *
 * Una sola fuente (finance-os.tokens.json) y dos destinos, porque el sistema
 * tiene que existir en dos plataformas que no comparten nada técnicamente:
 *
 *   build/finance-os.css         → variables CSS (web, claro + oscuro)
 *   build/finance-os.excel.json  → mapa plano para el tema y los estilos de celda
 *
 * Nada de lo que hay en build/ se edita a mano.
 *
 *   node finance-os/tokens/build-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(resolve(here, 'finance-os.tokens.json'), 'utf8'));

const path = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

const deref = (value, depth = 0) => {
  if (depth > 8) throw new Error('Referencia circular en los tokens');
  if (typeof value !== 'string') return value;
  const m = /^\{(.+)\}$/.exec(value.trim());
  return m ? deref(path(tokens, m[1]), depth + 1) : value;
};

const resolveMode = (name) =>
  Object.fromEntries(Object.entries(tokens.semantic[name]).map(([k, v]) => [k, deref(v)]));

/* ------------------------------------------------------------------ CSS --- */

const block = (map, indent = '  ') =>
  Object.entries(map)
    .map(([k, v]) => `${indent}--fos-${k}: ${v};`)
    .join('\n');

const scale = Object.entries(tokens.typography.scale)
  .map(([k, v]) => `  --fos-text-${k}: ${v.px / 16}rem;\n  --fos-leading-${k}: ${v.lh / 16}rem;`)
  .join('\n');

const spacing = Object.entries(tokens.space)
  .filter(([k]) => !k.startsWith('$'))
  .map(([k, v]) => `  --fos-space-${k}: ${v.px / 16}rem;`)
  .join('\n');

const radii = Object.entries(tokens.radius)
  .filter(([k]) => !k.startsWith('$'))
  .map(([k, v]) => `  --fos-radius-${k}: ${v === 9999 ? '9999px' : `${v}px`};`)
  .join('\n');

const elevation = Object.entries(tokens.elevation)
  .filter(([k]) => !k.startsWith('$'))
  .map(([k, v]) => `  --fos-elevation-${k}: ${v.web};`)
  .join('\n');

const seriesBlock = (name) =>
  Object.entries(tokens.primitive.series[name])
    .map(([slot, v]) => `  --fos-series-${slot}: ${v};`)
    .join('\n');

const css = `/**
 * Finance OS v1.0 — tokens de diseño.
 * GENERADO por finance-os/tokens/build-tokens.mjs. No editar a mano.
 *
 * Los componentes referencian SIEMPRE la capa semántica (--fos-surface, --fos-text-primary…),
 * nunca la primitiva. Eso es lo que convierte el modo oscuro en un cambio de paleta
 * en lugar de una variante por elemento.
 */

:root {
  color-scheme: light;

${block(resolveMode('light'))}
${seriesBlock('light')}

  /* Tipografía */
  --fos-font-ui: ${tokens.typography.family.ui.web};
  --fos-font-mono: ${tokens.typography.family.mono.web};
  --fos-numerals-tabular: ${tokens.typography.features.tabular};
${scale}

  /* Espaciado — rejilla de 8 px */
${spacing}

  /* Radios */
${radii}

  /* Elevación */
${elevation}

  /* Movimiento */
  --fos-duration-fast: ${tokens.motion.duration.fast}ms;
  --fos-duration-base: ${tokens.motion.duration.base}ms;
  --fos-duration-slow: ${tokens.motion.duration.slow}ms;
  --fos-ease-standard: ${tokens.motion.easing.standard};
  --fos-ease-enter: ${tokens.motion.easing.enter};
  --fos-ease-exit: ${tokens.motion.easing.exit};
}

/* El modo oscuro solo existe en web. Excel es siempre claro. */
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme='light'])) {
    color-scheme: dark;

${block(resolveMode('dark'))}
${seriesBlock('dark')}
  }
}

:root[data-theme='dark'] {
  color-scheme: dark;

${block(resolveMode('dark'))}
${seriesBlock('dark')}
}

/* Una cifra que se anima es una cifra en la que se desconfía. */
@media (prefers-reduced-motion: reduce) {
  :root {
    --fos-duration-fast: 0ms;
    --fos-duration-base: 0ms;
    --fos-duration-slow: 0ms;
  }
}
`;

/* ---------------------------------------------------------------- Excel --- */

const light = resolveMode('light');

const excel = {
  $generated: 'finance-os/tokens/build-tokens.mjs — no editar a mano',
  $note:
    'Excel es siempre claro. Los colores van en RGB hex sin almohadilla, tal como los ' +
    'espera el XML de theme1.xml y la propiedad Interior.Color de VBA (que además invierte a BGR).',
  theme: {
    /* Correspondencia con los 12 huecos del tema de Office. */
    lt1: light.surface.slice(1),
    dk1: light['text-primary'].slice(1),
    lt2: light.canvas.slice(1),
    dk2: light['text-secondary'].slice(1),
    accent1: light.accent.slice(1),
    accent2: tokens.primitive.series.light['2'].slice(1),
    accent3: tokens.primitive.series.light['3'].slice(1),
    accent4: tokens.primitive.series.light['4'].slice(1),
    accent5: tokens.primitive.series.light['5'].slice(1),
    accent6: tokens.primitive.series.light['6'].slice(1),
    hlink: light['text-accent'].slice(1),
    folHlink: tokens.primitive.indigo['700'].slice(1),
  },
  color: Object.fromEntries(
    Object.entries(light)
      .filter(([, v]) => typeof v === 'string' && v.startsWith('#'))
      .map(([k, v]) => [k, v.slice(1)])
  ),
  font: {
    family: tokens.typography.family.ui.excel,
    mono: tokens.typography.family.mono.excel,
    sizePt: Object.fromEntries(
      Object.entries(tokens.typography.scale).map(([k, v]) => [k, v.pt])
    ),
  },
  /* Excel mide en puntos: 1 px @96 dpi = 0,75 pt. La rejilla de 8 px es una rejilla de 6 pt. */
  rowHeightPt: {
    compact: tokens.size['row-compact'].pt,
    default: tokens.size['row-default'].pt,
    relaxed: tokens.size['row-relaxed'].pt,
    spacer: tokens.space['2'].pt,
    sectionGap: tokens.space['5'].pt,
  },
  borderWeightPt: {
    hairline: tokens.size['border-hairline'].pt,
    medium: 1.5,
  },
};

writeFileSync(resolve(here, 'build/finance-os.css'), css);
writeFileSync(resolve(here, 'build/finance-os.excel.json'), `${JSON.stringify(excel, null, 2)}\n`);

console.log('Escrito build/finance-os.css');
console.log('Escrito build/finance-os.excel.json');
