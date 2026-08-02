import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';

import { MAX_QR_VERSION, encodeQr, type QrCode } from './qr';

/**
 * A QR that encodes to garbage looks exactly like one that works, so these
 * tests do not inspect the matrix — they **decode it with an independent
 * decoder**. That is the only assertion that means anything about a hand-
 * written encoder, and it is why writing one was defensible at all.
 */
function decode(qr: QrCode): string | null {
  const SCALE = 4;
  const QUIET = 4; // modules of margin, as the specification requires
  const side = (qr.size + QUIET * 2) * SCALE;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);

  for (let row = 0; row < qr.size; row++) {
    for (let col = 0; col < qr.size; col++) {
      if (!qr.modules[row]?.[col]) continue;

      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          const y = (row + QUIET) * SCALE + dy;
          const x = (col + QUIET) * SCALE + dx;
          const offset = (y * side + x) * 4;
          pixels[offset] = 0;
          pixels[offset + 1] = 0;
          pixels[offset + 2] = 0;
        }
      }
    }
  }

  return jsQR(pixels, side, side)?.data ?? null;
}

describe('encodeQr', () => {
  it('produces a symbol an independent decoder reads back', () => {
    const text = 'https://pricelens.app/?country=TH&to=EUR&amount=1890';
    const qr = encodeQr(text)!;

    expect(qr).not.toBeNull();
    expect(decode(qr)).toBe(text);
  });

  it('round-trips a realistic share URL for every country in the picker', () => {
    // The longest URLs this app can produce, at both ends of the amount range.
    for (const [country, to, amount] of [
      ['TH', 'EUR', '1890'],
      ['VN', 'ARS', '999999999'],
      ['KW', 'JPY', '0.001'],
      ['US', 'USD', ''],
    ]) {
      const url = `https://pricelens.app/?country=${country}&to=${to}&amount=${amount}`;
      expect(decode(encodeQr(url)!), url).toBe(url);
    }
  });

  it.each([1, 8, 16, 17, 32, 64, 100, 128, 200, 213])(
    'round-trips a %i-byte payload, crossing every version boundary',
    (length) => {
      // Version and block structure change with length, so a wrong table shows
      // up as a decode failure in one band and nowhere else.
      const text = 'a'.repeat(length);
      const qr = encodeQr(text);

      expect(qr, `${length} bytes should fit`).not.toBeNull();
      expect(decode(qr!)).toBe(text);
    },
  );

  it('round-trips every length up to the capacity of version 4', () => {
    // Exhaustive across the small versions, where padding and terminator
    // truncation are fiddliest.
    for (let length = 1; length <= 62; length++) {
      const text = 'x'.repeat(length);
      expect(decode(encodeQr(text)!), `${length} bytes`).toBe(text);
    }
  });

  it('handles multi-byte characters by their UTF-8 length', () => {
    const text = 'https://pricelens.app/?país=España&moneda=€';
    expect(decode(encodeQr(text)!)).toBe(text);
  });

  it('grows the version only as far as it needs to', () => {
    expect(encodeQr('a'.repeat(10))!.version).toBe(1);
    expect(encodeQr('a'.repeat(60))!.version).toBeGreaterThan(1);
    expect(encodeQr('a'.repeat(60))!.version).toBeLessThan(MAX_QR_VERSION);
  });

  it('reports a square matrix of the version-implied size', () => {
    const qr = encodeQr('https://pricelens.app/')!;

    expect(qr.size).toBe(qr.version * 4 + 17);
    expect(qr.modules).toHaveLength(qr.size);
    for (const row of qr.modules) expect(row).toHaveLength(qr.size);
  });

  it('returns null rather than throwing when the text cannot fit', () => {
    // The caller's response is to show no QR, which is not an error.
    expect(encodeQr('x'.repeat(5000))).toBeNull();
  });
});
