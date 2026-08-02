// Generates the PWA icon set: a lens ring on brand blue.
// Pure Node (zlib only) so there is no image dependency in the project.
// Supersampled 4x for clean edges.
//
// The encoder and the mark itself live in ./lib, shared with the launch-screen
// generator so the two sets can never drift apart. Output is byte-identical to
// the version that inlined them.

import { writeFileSync, mkdirSync } from 'node:fs';

import { renderMark } from './lib/mark.mjs';
import { encodePng } from './lib/png.mjs';

mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });

const outputs = [
  ['icon-192.png', 192, { rounded: true, inset: 0 }],
  ['icon-512.png', 512, { rounded: true, inset: 0 }],
  ['icon-maskable-512.png', 512, { rounded: false, inset: 0.2 }],
  ['apple-touch-icon.png', 180, { rounded: false, inset: 0 }],
];

for (const [name, size, opts] of outputs) {
  const buf = encodePng(size, size, renderMark(size, opts));
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), buf);
  console.log(name, size + 'x' + size, buf.length + ' bytes');
}
