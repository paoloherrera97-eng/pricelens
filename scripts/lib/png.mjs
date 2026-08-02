// A minimal PNG encoder — truecolour RGB, no alpha, one IDAT.
//
// Pure Node (zlib only). The project ships no image dependency, and adding one
// to draw two flat shapes would be a poor trade: this file is smaller than the
// lockfile entry a library would cost, and it never breaks.

import { deflateSync } from 'node:zlib';

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

/**
 * Encodes a PNG.
 *
 * `pixels` is a flat row-major array of `[r, g, b]` triples, `width * height`
 * long.
 *
 * `filter` selects the per-row PNG filter. `0` (None) stores bytes as they are.
 * `2` (Up) stores each row as its difference from the row above, which turns a
 * flat expanse into a run of zeroes — worth roughly 4× on the launch screens,
 * which are one colour with a small mark in the middle. The icons stay on `0`
 * so their bytes are unchanged by this option existing.
 */
export function encodePng(width, height, pixels, { filter = 0 } = {}) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB

  const raw = Buffer.alloc(height * (width * 3 + 1));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = filter;
    for (let x = 0; x < width; x++) {
      const p = pixels[y * width + x];
      // Filter Up subtracts the byte directly above; row 0 has nothing above
      // it, so it subtracts zero and stores the pixel as-is.
      const above = filter === 2 && y > 0 ? pixels[(y - 1) * width + x] : [0, 0, 0];
      raw[o++] = (p[0] - above[0]) & 0xff;
      raw[o++] = (p[1] - above[1]) & 0xff;
      raw[o++] = (p[2] - above[2]) & 0xff;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Linear blend between two `[r, g, b]` colours. */
export function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
