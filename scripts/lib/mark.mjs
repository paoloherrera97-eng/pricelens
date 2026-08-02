// The PriceLens mark: a thick white ring with a short handle, on brand blue.
//
// Shared by the icon set and the iOS launch screens so the two can never drift.

import { mix } from './png.mjs';

export const BLUE = [0x25, 0x63, 0xeb];
export const WHITE = [0xff, 0xff, 0xff];
/** neutral-50 — the page background, and the default outside the tile. */
export const NEUTRAL_50 = [248, 250, 252];

const SS = 4; // supersample factor

/**
 * Draws the mark on a square canvas.
 *
 * - `inset` shrinks the mark for maskable icons, where platforms crop to a
 *   circle covering ~80% of the canvas.
 * - `rounded` draws the blue tile as a rounded square; `false` fills the canvas
 *   edge to edge.
 * - `outside` is what surrounds a rounded tile — the colour the tile is being
 *   placed on, so its antialiased corners blend into it rather than into a
 *   fringe of some other colour.
 */
export function renderMark(size, { inset = 0, rounded = true, outside = NEUTRAL_50 } = {}) {
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
            const dist =
              Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - corner;
            bg = dist <= 0;
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
      const base = mix(outside, BLUE, inBgN / total);
      px[y * size + x] = mix(base, WHITE, inMarkN / total);
    }
  }
  return px;
}
