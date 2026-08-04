#!/usr/bin/env node
/**
 * Finance OS — auditoría de contraste.
 *
 * Lee finance-os/tokens/finance-os.tokens.json, resuelve las referencias
 * {primitive.x.y} y mide cada par que la documentación afirma que es legible.
 * Las cifras del Design System salen de aquí: se miden, no se estiman.
 *
 *   node finance-os/qa/contrast/audit.mjs            → informe en consola
 *   node finance-os/qa/contrast/audit.mjs --write    → además escribe REPORT.md
 *
 * Sale con código 1 si algún par obligatorio incumple su umbral.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = resolve(here, '../../tokens/finance-os.tokens.json');
const REPORT = resolve(here, 'REPORT.md');

const tokens = JSON.parse(readFileSync(TOKENS, 'utf8'));

/* ---------------------------------------------------------------- color --- */

const hex = (value) => {
  const m = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) throw new Error(`No es un hex de 6 dígitos: ${value}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (value) => {
  const [r, g, b] = hex(value).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.2 SC 1.4.3 / 1.4.11 — razón de contraste entre dos colores opacos. */
const contrast = (fg, bg) => {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

/* --------------------------------------------------------------- tokens --- */

const path = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/** Resuelve `{primitive.graphite.900}` hasta un hex literal. */
const resolveToken = (value, seen = 0) => {
  if (seen > 8) throw new Error('Referencia circular en los tokens');
  if (typeof value !== 'string') return null;
  const m = /^\{(.+)\}$/.exec(value.trim());
  if (!m) return value;
  return resolveToken(path(tokens, m[1]), seen + 1);
};

const mode = (name) => {
  const out = {};
  for (const [key, value] of Object.entries(tokens.semantic[name])) {
    const hexValue = resolveToken(value);
    if (typeof hexValue === 'string' && hexValue.startsWith('#')) out[key] = hexValue;
  }
  return out;
};

/* ---------------------------------------------------------------- pares --- */

/**
 * `min` es el umbral que exige la WCAG para ese par:
 *   4.5 → texto normal (1.4.3)
 *   3.0 → texto grande ≥24 px / ≥18,66 px bold, y componentes no textuales (1.4.11)
 *   0   → informativo; el token está exento (deshabilitado, divisor decorativo)
 */
const PAIRS = [
  ['text-primary', 'surface', 4.5, 'Cifra y encabezado sobre card'],
  ['text-primary', 'canvas', 4.5, 'Cifra sobre fondo de aplicación'],
  ['text-primary', 'surface-sunken', 4.5, 'Texto dentro de campo relleno'],
  ['text-secondary', 'surface', 4.5, 'Etiqueta, texto de apoyo'],
  ['text-secondary', 'canvas', 4.5, 'Etiqueta sobre fondo'],
  ['text-tertiary', 'surface', 4.5, 'Placeholder, texto de eje'],
  ['text-tertiary', 'surface-sunken', 4.5, 'Placeholder dentro de campo'],
  ['text-disabled', 'surface', 0, 'Deshabilitado — exento de 1.4.3'],
  ['text-accent', 'surface', 4.5, 'Enlace, botón terciario'],
  ['text-accent', 'surface-accent', 4.5, 'Enlace sobre superficie teñida'],
  ['text-positive', 'surface', 4.5, 'Variación favorable'],
  ['text-positive', 'surface-positive', 4.5, 'Badge favorable'],
  ['text-negative', 'surface', 4.5, 'Variación desfavorable'],
  ['text-negative', 'surface-negative', 4.5, 'Badge desfavorable'],
  ['text-warning', 'surface', 4.5, 'Aviso, dato estimado'],
  ['text-warning', 'surface-warning', 4.5, 'Badge de aviso'],
  ['text-on-accent', 'accent', 4.5, 'Etiqueta de botón primario'],
  ['text-on-accent', 'accent-hover', 4.5, 'Botón primario en hover'],
  ['border-strong', 'surface', 3.0, 'Límite de control (1.4.11)'],
  ['border-strong', 'surface-sunken', 3.0, 'Límite de campo relleno'],
  ['border-focus', 'surface', 3.0, 'Anillo de foco (1.4.11)'],
  ['border-focus', 'canvas', 3.0, 'Anillo de foco sobre fondo'],
  ['accent', 'surface', 3.0, 'Marca de dato / relleno de serie'],
  ['border-default', 'surface', 0, 'Divisor decorativo — nunca un límite'],
  ['border-subtle', 'surface', 0, 'Divisor decorativo'],
];

/* -------------------------------------------------------------- informe --- */

const run = (name) => {
  const colors = mode(name);
  const rows = PAIRS.map(([fg, bg, min, use]) => {
    const ratio = contrast(colors[fg], colors[bg]);
    return {
      fg,
      bg,
      fgHex: colors[fg],
      bgHex: colors[bg],
      ratio: Math.round(ratio * 100) / 100,
      min,
      pass: min === 0 ? null : ratio >= min,
      use,
    };
  });
  return { name, rows, failures: rows.filter((r) => r.pass === false) };
};

const series = (name) => {
  const surface = mode(name).surface;
  return Object.entries(tokens.primitive.series[name]).map(([slot, value]) => ({
    slot,
    hex: value,
    ratio: Math.round(contrast(value, surface) * 100) / 100,
  }));
};

const results = [run('light'), run('dark')];
const seriesResults = [series('light'), series('dark')];

const mark = (r) => (r.pass === null ? '—' : r.pass ? 'OK' : 'FALLA');

for (const { name, rows, failures } of results) {
  console.log(`\n${name.toUpperCase()} — ${rows.length} pares`);
  for (const r of rows) {
    console.log(
      `  ${mark(r).padEnd(6)} ${String(r.ratio).padStart(6)}:1  ` +
        `(min ${r.min || '—'})  ${r.fg} sobre ${r.bg}`,
    );
  }
  console.log(`  → ${failures.length === 0 ? 'sin fallos' : `${failures.length} FALLO(S)`}`);
}

seriesResults.forEach((rows, i) => {
  const name = i === 0 ? 'light' : 'dark';
  const worst = Math.min(...rows.map((r) => r.ratio));
  console.log(
    `\nSERIES ${name}: peor contraste sobre superficie ${worst}:1 (umbral 3,0 para marcas)`,
  );
});

const table = (rows) =>
  [
    '| Frente | Fondo | Hex | Ratio | Mínimo | Estado | Uso |',
    '| --- | --- | --- | ---: | ---: | :---: | --- |',
    ...rows.map(
      (r) =>
        `| \`${r.fg}\` | \`${r.bg}\` | ${r.fgHex} / ${r.bgHex} | **${r.ratio.toFixed(2)}:1** | ` +
        `${r.min || '—'} | ${mark(r)} | ${r.use} |`,
    ),
  ].join('\n');

const seriesTable = (rows) =>
  [
    '| Ranura | Hex | Contraste sobre superficie |',
    '| --- | --- | ---: |',
    ...rows.map((r) => `| ${r.slot} | ${r.hex} | ${r.ratio.toFixed(2)}:1 |`),
  ].join('\n');

if (process.argv.includes('--write')) {
  const body = `# Finance OS — informe de contraste

> Generado por \`node finance-os/qa/contrast/audit.mjs --write\`. **No editar a mano.**
> Cada cifra del Design System que afirme una razón de contraste debe coincidir con este archivo.

Umbrales: **4,5:1** texto normal (WCAG 2.2 SC 1.4.3) · **3,0:1** componentes no textuales y
límites de control (SC 1.4.11) · **—** token exento (texto deshabilitado, divisor decorativo).

## Modo claro — canónico, y el único que existe en Excel

${table(results[0].rows)}

## Modo oscuro — solo web

${table(results[1].rows)}

## Paleta categórica sobre superficie

Umbral de marca de dato: 3,0:1. La separación entre series se valida aparte con el simulador
Machado-Oliveira-Fernandes 2009 (ver \`design-system/components/20-graficos.md\`).

### Claro

${seriesTable(seriesResults[0])}

### Oscuro

${seriesTable(seriesResults[1])}
`;
  writeFileSync(REPORT, body);
  console.log(`\nEscrito ${REPORT}`);
}

const failed = results.reduce((n, r) => n + r.failures.length, 0);
if (failed > 0) {
  console.error(`\n${failed} par(es) por debajo del umbral.`);
  process.exit(1);
}
