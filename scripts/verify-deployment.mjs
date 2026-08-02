#!/usr/bin/env node
/**
 * Post-deployment smoke test.
 *
 * Checks a live PriceLens deployment the way a user would meet it: over HTTPS,
 * in a real browser, including the parts that only exist in production — the
 * service worker, offline navigation, and installability.
 *
 *   node scripts/verify-deployment.mjs https://your-app.vercel.app
 *
 * Exits non-zero if any check fails, so it doubles as a CI gate.
 *
 * Requires Playwright:  npx playwright install chromium
 */

import { chromium, devices } from 'playwright';

const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) {
  console.error('Usage: node scripts/verify-deployment.mjs https://your-app.vercel.app');
  process.exit(2);
}

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
};

/**
 * Runs a check that touches the page, turning any failure into a reported
 * result rather than a crash. A verification tool is most needed when the
 * deployment is partly broken — throwing on the first problem would hide every
 * check after it.
 */
async function attempt(name, fn, detailOnError = 'not found') {
  try {
    const [pass, detail] = await fn();
    check(name, pass, detail);
    return pass;
  } catch (error) {
    check(name, false, error?.name === 'TimeoutError' ? detailOnError : String(error).slice(0, 80));
    return false;
  }
}

console.log(`\nVerifying ${base}\n`);

const launchOptions = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const browser = await chromium.launch(launchOptions);

try {
  // ---- Transport ---------------------------------------------------------
  check('served over HTTPS', base.startsWith('https://'), base.split('://')[0]);

  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'es-ES' });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  const response = await page.goto(base + '/', { waitUntil: 'networkidle' });
  check('home page responds 200', response?.status() === 200, `status ${response?.status()}`);

  const headers = response?.headers() ?? {};
  check(
    'HSTS enabled',
    Boolean(headers['strict-transport-security']),
    headers['strict-transport-security'] ?? 'header absent (Vercel sets this on custom domains)',
  );

  // ---- The product actually works ---------------------------------------
  check('page is in Spanish', (await page.getAttribute('html', 'lang')) === 'es');

  // If rates cannot be fetched the app shows its error state by design
  // (ADR-013), so report that explicitly rather than as a mystery failure.
  const converterReady = await page
    .getByRole('button', { name: /país viajas/ })
    .isVisible({ timeout: 10_000 })
    .catch(() => false);
  const errorState = await page
    .getByText('No hemos podido obtener las tasas')
    .isVisible()
    .catch(() => false);
  check(
    'converter renders',
    converterReady,
    errorState ? 'showing the rates-unavailable state — check /api/rates' : '',
  );

  if (converterReady) {
    await attempt('conversion produces a result', async () => {
      await page.getByLabel('Importe').fill('1890', { timeout: 10_000 });
      await page.waitForTimeout(300);
      const result = (await page.locator('[aria-live="polite"]').innerText())
        .replace(/\s+/g, ' ')
        .trim();
      return [/\d/.test(result), result.slice(0, 40)];
    });
    await attempt('effective rate shown', async () => [
      await page
        .getByText(/^1 [A-Z]{3} =/)
        .first()
        .isVisible({ timeout: 5000 }),
    ]);
    await attempt('update time shown', async () => [
      await page
        .getByText(/Actualizado/)
        .first()
        .isVisible({ timeout: 5000 }),
    ]);
  }

  // ---- Live rates --------------------------------------------------------
  await attempt('/api/rates returns a real table', async () => {
    const res = await page.request.get(base + '/api/rates');
    if (!res.ok()) return [false, `status ${res.status()} — every provider failed`];
    const rates = await res.json();
    const count = Object.keys(rates?.rates ?? {}).length;
    const ageHours = (Date.now() - new Date(rates?.fetchedAt).getTime()) / 3_600_000;
    check('rates are not flagged degraded', rates?.degraded === false);
    check('rates are recent', ageHours < 48, `${ageHours.toFixed(1)}h old`);
    return [count > 100, `${count} currencies`];
  });

  // ---- PWA ---------------------------------------------------------------
  const manifest = await (await page.request.get(base + '/manifest.webmanifest')).json();
  check('manifest: standalone display', manifest.display === 'standalone');
  check('manifest: start_url set', Boolean(manifest.start_url));
  check(
    'manifest: has a 512px icon',
    manifest.icons?.some((i) => i.sizes === '512x512'),
  );
  check(
    'manifest: has a maskable icon',
    manifest.icons?.some((i) => i.purpose === 'maskable'),
  );

  const swResponse = await page.request.get(base + '/sw.js');
  check('service worker is served', swResponse.status() === 200);
  check(
    'service worker is not cached by the CDN',
    /no-cache|no-store|max-age=0/.test(swResponse.headers()['cache-control'] ?? ''),
    swResponse.headers()['cache-control'] ?? 'no cache-control',
  );

  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return 'not-registered';
    await navigator.serviceWorker.ready;
    return reg.active ? 'active' : 'installing';
  });
  check('service worker reaches active', swState === 'active', swState);

  // ---- Offline -----------------------------------------------------------
  await ctx.setOffline(true);
  const offline = await page
    .goto(base + '/', { waitUntil: 'domcontentloaded' })
    .then(() => true)
    .catch(() => false);
  check('renders with the network disabled', offline);
  if (offline && converterReady) {
    await attempt('converter still usable offline', async () => [
      await page.getByLabel('Importe').isVisible({ timeout: 5000 }),
    ]);
  }
  await ctx.setOffline(false);
  await ctx.close();

  // ---- Responsive + touch targets ---------------------------------------
  for (const [label, viewport] of [
    ['320px', { width: 320, height: 640 }],
    ['390px', { width: 390, height: 844 }],
    ['768px', { width: 768, height: 1024 }],
    ['1280px', { width: 1280, height: 800 }],
  ]) {
    const c = await browser.newContext({ viewport, locale: 'es-ES' });
    const p = await c.newPage();
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    const layout = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      small: [...document.querySelectorAll('button, input')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height < 43.5;
      }).length,
      unnamed: [...document.querySelectorAll('button')].filter(
        (b) => !(b.getAttribute('aria-label') || b.textContent || '').trim(),
      ).length,
    }));
    check(`${label}: no horizontal overflow`, !layout.overflow);
    check(`${label}: all touch targets >= 44px`, layout.small === 0, `${layout.small} too small`);
    check(`${label}: every button has a name`, layout.unnamed === 0, `${layout.unnamed} unnamed`);
    await c.close();
  }

  check('no console errors', consoleErrors.length === 0, consoleErrors[0] ?? '');
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('\nFailed:');
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
  process.exit(1);
}
console.log('Deployment looks good.\n');
