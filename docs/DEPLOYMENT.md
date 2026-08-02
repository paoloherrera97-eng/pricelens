# PriceLens — Deployment

**Target:** Vercel · **Required environment variables: none.**

One _optional_ variable exists: `NEXT_PUBLIC_SITE_URL`, needed only after a custom domain is
connected (§4).

That last point is the payoff of ADR-002: the rate provider is keyless, so a fresh clone deploys and
runs with nothing to configure. If a future change adds a required secret, that is an architectural
decision needing an ADR, not a config task.

---

## 1. Pre-flight

Everything here passes on `main` before a deploy is worth starting:

```bash
pnpm install --frozen-lockfile
pnpm verify        # lint → typecheck → test → build
```

Expected: **0 lint errors, 0 type errors, 148 tests passing, build with no warnings.**

---

## 2. Deploy

### Option A — Git integration (recommended)

1. Go to <https://vercel.com/new> and import `paoloherrera97-eng/pricelens`.
2. Accept every default. Vercel detects Next.js; the framework preset is correct.
   - Build command: `pnpm build` (auto)
   - Output: `.next` (auto)
   - Install: `pnpm install` (auto — `packageManager` pins pnpm 10.33.0)
   - Node: 22.x (auto — from `engines`)
3. **Leave environment variables empty.**
4. Deploy.

Every pull request then gets its own preview URL, and `main` becomes production.

### Option B — CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### A note on branches

The MVP currently lives on `claude/pricelens-mvp-architecture-xlz8gw` (PR #1, draft). Vercel builds
production from the repository's default branch, so **merge the PR before expecting a production
deploy** — otherwise you will only get preview deployments.

---

## 3. Verify the deployment

```bash
node scripts/verify-deployment.mjs https://your-app.vercel.app
```

It checks, against the live site: HTTPS and security headers, the manifest and its icons, the
service worker and its cache headers, `/api/rates` returning a real table, offline navigation after
a first load, responsive layout at four widths, touch-target sizes, and accessible names. It exits
non-zero on failure, so it also works as a smoke test in CI.

Manually, on a real phone, the parts a script cannot judge:

- Install it — iOS: Share → _Add to Home Screen_. Android: the install prompt appears on its own.
- Open the installed app, convert something, then enable airplane mode and reopen it. It should
  still convert, on the cached rates, with the amber offline banner.

---

## 4. Connecting a custom domain (e.g. `pricelens.app`)

Nothing in the codebase hardcodes a hostname, so this is entirely a Vercel and DNS task — no code
change and no redeploy.

1. **Buy the domain.** `.app` is on the HSTS preload list, which means browsers _require_ HTTPS.
   Vercel provisions the certificate automatically, so this is a benefit rather than an obstacle —
   but it does mean the site will not load over plain HTTP at any point.
2. **Add it in Vercel:** Project → Settings → Domains → Add → `pricelens.app`.
   Add `www.pricelens.app` too, and set one to redirect to the other. Pick the apex (`pricelens.app`)
   as canonical unless you have a reason not to.
3. **Point DNS at Vercel**, using whichever your registrar supports:

   | Record  | Name  | Value                  |
   | ------- | ----- | ---------------------- |
   | `A`     | `@`   | `76.76.21.21`          |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

   Verify the current values in Vercel's Domains panel rather than trusting this table — Vercel has
   changed its apex IP before, and the panel is authoritative.

   Alternatively, move the nameservers to Vercel and let it manage DNS entirely; simpler if the
   domain does nothing else, worse if you also run email on it.

4. **Wait for propagation** (minutes to a few hours) and confirm the certificate is issued in the
   Domains panel.
5. **Set `NEXT_PUBLIC_SITE_URL` to the new origin** in Vercel → Settings → Environment Variables
   (e.g. `https://pricelens.app`), then redeploy. Canonical URLs, `sitemap.xml`, `robots.txt` and the
   Open Graph image URL all derive from it (`config/site.ts`). Until it is set they resolve from
   `VERCEL_PROJECT_PRODUCTION_URL`, which stays the `*.vercel.app` hostname — so search engines would
   keep treating that as canonical.

   It must be a **build-time** variable: these routes are statically prerendered, so a value added
   without a redeploy has no effect.

6. **Re-run the verification script against the new hostname.** The manifest's `start_url` and
   `scope` are relative (`/`), so they follow the domain automatically — but confirm rather than
   assume.

### After the domain changes

- **The PWA identity changes with the origin.** An app installed from
  `pricelens.vercel.app` is a different installation from one on `pricelens.app`, with separate
  storage and its own service worker. Early testers will need to re-install. Worth doing the domain
  move _before_ sharing the link widely.
- Add the production URL to `metadataBase` in `app/layout.tsx` if link previews are ever needed;
  not required for the app to function.

---

## 5. Rollback

Vercel keeps every previous deployment. Project → Deployments → pick the last good one → **Promote to
Production**. It is instant, and it does not require a git revert.

Note the one thing a rollback does not undo: **a service worker already installed on a user's
device.** `sw.js` is served with `no-cache` precisely so a new worker is picked up on the next visit,
but a user offline at that moment keeps the old one until they reconnect. If a bad worker ever ships,
bump `CACHE_VERSION` in `public/sw.js` — its `activate` handler deletes every cache that is not in
the current set.

---

## 6. What to watch after launch

| Thing                     | Why it matters                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `/api/rates` 5xx rate     | Every failure is a user who sees "rates unavailable" (ADR-013)                                                                 |
| Provider response shape   | The route validates strictly and rejects malformed payloads wholesale — a provider change surfaces as a 503, not a wrong price |
| Function invocation count | Should be low: the Data Cache serves one upstream call per hour per deployment (ADR-001)                                       |
| Country data drift        | Currency changes are rare but real — see the `NOTE` entries in `scripts/generate-countries.mjs`                                |
