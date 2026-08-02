#!/usr/bin/env node
/**
 * Generates public/og.png — the 1200×630 link-preview card.
 *
 * Rendered once with Chromium and committed as a static file, rather than
 * generated per request with `next/og`. A social card changes about as often as
 * the logo does, so paying a serverless render for every crawler hit buys
 * nothing. This way the image is a plain static asset on the CDN, adds no
 * runtime dependency, and can be eyeballed in the repo.
 *
 *   node scripts/generate-og-image.mjs
 *
 * Requires Playwright (dev-only, same as scripts/verify-deployment.mjs):
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';

const WIDTH = 1200;
const HEIGHT = 630;

// Brand values, mirrored from app/globals.css. Kept literal because this runs
// outside the bundler and cannot import the token layer.
const BLUE = '#2563EB';
const INK = '#0F172A';
const MUTED = '#5B6B7F';
const SURFACE = '#FFFFFF';
const CANVAS = '#F8FAFC';

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: ${CANVAS};
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    display: flex; align-items: center; justify-content: center;
    -webkit-font-smoothing: antialiased;
  }
  .card {
    width: 1040px; padding: 72px 80px;
    background: ${SURFACE};
    border-radius: 40px;
    box-shadow: 0 24px 64px -16px rgb(15 23 42 / 0.12);
    display: flex; flex-direction: column; gap: 40px;
  }
  .brand { display: flex; align-items: center; gap: 24px; }
  .mark {
    width: 88px; height: 88px; border-radius: 26px; background: ${BLUE};
    display: flex; align-items: center; justify-content: center;
  }
  .name { font-size: 56px; font-weight: 700; letter-spacing: -0.03em; color: ${INK}; }
  .demo { display: flex; align-items: baseline; gap: 28px; }
  .from { font-size: 60px; font-weight: 600; color: ${MUTED}; font-variant-numeric: tabular-nums; }
  .arrow { font-size: 44px; color: ${MUTED}; }
  .to {
    font-size: 96px; font-weight: 700; color: ${INK};
    letter-spacing: -0.035em; font-variant-numeric: tabular-nums;
  }
  .tagline { font-size: 32px; line-height: 1.35; color: ${MUTED}; max-width: 820px; }
</style></head>
<body>
  <div class="card">
    <div class="brand">
      <div class="mark">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="white" stroke-width="2.6"/>
          <path d="M15.5 15.5L21 21" stroke="white" stroke-width="2.6" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="name">PriceLens</div>
    </div>
    <div class="demo">
      <span class="from">฿1.890</span>
      <span class="arrow">→</span>
      <span class="to">49,12&nbsp;€</span>
    </div>
    <div class="tagline">Entiende al instante cuánto vale un precio extranjero en tu moneda.</div>
  </div>
</body></html>`;

const launchOptions = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
// OG_OUT lets the script be run from a checkout that has Playwright installed
// elsewhere; by default it writes into this repo's public/ directory.
const outPath = process.env.OG_OUT ?? new URL('../public/og.png', import.meta.url).pathname;
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log(`Wrote ${outPath} (${WIDTH}×${HEIGHT})`);
