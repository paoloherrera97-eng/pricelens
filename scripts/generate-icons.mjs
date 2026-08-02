// Generates the PWA icon set: a lens ring on brand blue.
// Pure Node (zlib only) so there is no image dependency in the project.
// Supersampled 4x for clean edges.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BLUE = [0x25, 0x63, 0xeb];
const WHITE = [0xff, 0xff, 0xff];
const SS = 4; // supersample factor

function crc32(buf) {
  let c,
    crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const p = pixels[y * size + x];
      raw[o++] = p[0];
      raw[o++] = p[1];
      raw[o++] = p[2];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Draws a lens: a thick white ring with a short handle, on blue.
 * `inset` shrinks the mark for maskable icons, where platforms crop to a circle
 * covering ~80% of the canvas.
 */
function render(size, { inset = 0, rounded = true } = {}) {
  const px = new Array(size * size);
  const c = size / 2;
  const scale = (1 - inset) * size;

  const ringR = scale * 0.2; // ring centreline radius
  const ringW = scale * 0.072; // ring thickness
  const handleW = scale * 0.066;
  const handleFrom = ringR + ringW * 0.3;
  const handleTo = ringR + scale * 0.15;
  const corner = size * 0.22; // for the non-maskable rounded square

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inMarkN = 0,
        inBgN = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px_ = x + (sx + 0.5) / SS;
          const py_ = y + (sy + 0.5) / SS;
          const dx = px_ - c;
          const dy = py_ - c;

          // Background shape
          let bg;
          if (rounded) {
            // Signed distance to a rounded box: the trailing `- corner` is what
            // actually rounds the corners.
            const qx = Math.abs(dx) - (size / 2 - corner);
            const qy = Math.abs(dy) - (size / 2 - corner);
            const outside =
              Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - corner;
            bg = outside <= 0;
          } else {
            bg = true;
          }
          if (bg) inBgN++;

          // Ring, drawn tilted 45° so the handle reads as a lens handle
          const r = Math.hypot(dx, dy);
          const onRing = Math.abs(r - ringR) <= ringW / 2;

          // Handle along the down-right diagonal
          const ux = Math.SQRT1_2,
            uy = Math.SQRT1_2;
          const proj = dx * ux + dy * uy;
          const perp = Math.abs(dx * uy - dy * ux);
          const onHandle = proj >= handleFrom && proj <= handleTo && perp <= handleW / 2;

          if (bg && (onRing || onHandle)) inMarkN++;
        }
      }
      const total = SS * SS;
      const bgA = inBgN / total;
      const markA = inMarkN / total;
      const base = mix([248, 250, 252], BLUE, bgA); // neutral-50 outside the shape
      px[y * size + x] = mix(base, WHITE, markA);
    }
  }
  return px;
}

mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });

const outputs = [
  ['icon-192.png', 192, { rounded: true, inset: 0 }],
  ['icon-512.png', 512, { rounded: true, inset: 0 }],
  ['icon-maskable-512.png', 512, { rounded: false, inset: 0.2 }],
  ['apple-touch-icon.png', 180, { rounded: false, inset: 0 }],
];

for (const [name, size, opts] of outputs) {
  const buf = png(size, render(size, opts));
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), buf);
  console.log(name, size + 'x' + size, buf.length + ' bytes');
}
