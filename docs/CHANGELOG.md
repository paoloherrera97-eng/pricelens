# Changelog

All notable changes to PriceLens are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added

- **Vercel Web Analytics** (`@vercel/analytics@2.0.1`), mounted in the root layout via the
  `@vercel/analytics/next` entry point. Aggregate page views only.

### Changed

- **The privacy requirement in `PRODUCT_REQUIREMENTS.md` §6 has been narrowed to stay true.** It
  previously promised "no tracking, no cookies, no PII, **no third-party client-side scripts**".
  Analytics is a client-side script that counts page views, so the claim no longer held as written.
  What remains true — no cookies, no PII, no cross-site tracking, no ad networks — is now stated
  precisely, and §6.2 records what changed and why the script is first-party and cookieless.

### Added — Phase 6: Deployment readiness

- **`docs/DEPLOYMENT.md`** — pre-flight, deploy, custom-domain, rollback, and post-launch monitoring.
- **`scripts/verify-deployment.mjs`** — a 27-check smoke test that runs against a live URL in a real
  browser: HTTPS and HSTS, manifest and icons, service worker registration and cache headers,
  `/api/rates` returning a real table, offline navigation, responsive layout at four widths, touch
  targets, and accessible names. Exits non-zero, so it works as a CI gate too.

### Fixed

- **The loading button lost its accessible name.** `Button` hid its label with `invisible`, and
  `visibility: hidden` removes an element from the accessibility tree. Found by an axe audit of the
  running app; the Phase 3 unit test passed because jsdom applies no Tailwind CSS. Now `opacity-0`,
  with a regression guard on the class.
- The design-system gallery had no `main` landmark.

### Changed

- **The bundle budget in `PRODUCT_REQUIREMENTS.md` §6 is now recorded as unmet, with the measurement.**
  The ≤100KB figure was written in Phase 1 without measuring; the real number is 175KB gzipped
  (150KB brotli), most of it React + the Next runtime + next-intl. §6.1 records the number and the
  reduction path rather than leaving a target that reads as if it were met.

### Verified

- Clean production build: **zero warnings, zero errors**
- **axe: 0 violations** across the converter, the open country picker, the error state, and the
  gallery, at WCAG 2.2 AA plus best-practice rules
- Service worker active, offline navigation working, manifest installable
- No overflow, no sub-44px target, no unnamed button at 320 / 390 / 768 / 1280px
- 148 tests, lint, typecheck, and format all clean

---

### Added — Phase 5: The Complete User Experience

The journey a traveler actually takes: open, pick the country, enter or paste a price, read the
answer.

- **Country-first selection** (ADR-014) — `config/countries.ts`, 195 countries with flags, Spanish
  names, and the currency each one uses. Searchable by country name, country code, currency code, or
  currency name, accent-insensitive.
- **`CountryPicker`** — flags lead, because a flag is recognised faster than any string.
- **`ConverterSkeleton`** — a loading state that mirrors the real layout block for block and in the
  same order, so nothing moves when the rates land.
- **Offline banner** — a quiet status line when the device is offline but real cached rates are still
  driving the conversion.
- **`scripts/generate-countries.mjs`** — the curated mapping is explicit and reviewable; names come
  from ICU and flags are computed from the country code.
- **19 new tests** (147 total), covering country data invariants, the country-first flow, paste, and
  the skeleton.

### Changed

- **The foreign currency badge was removed.** The country selector already shows the currency code
  and the amount field already shows its symbol; a third copy was the same information competing with
  itself. The amount field now takes the full width.
- **A lone separator with three trailing digits now parses as grouping.** The app ships in Spanish,
  where `1.890` means one thousand eight hundred ninety — the previous locale-agnostic rule read it
  as 1.89, which is exactly wrong for a pasted Spanish price. `0.500` and `12.50` still parse as
  decimals, since nobody writes zero thousands.

### Decisions recorded

- **ADR-014 — Country-first selection.** A currency selector asks the traveler to translate their
  situation into a code before the app can help: _I am in Thailand → Thailand uses the baht → the
  baht is THB → select THB_. Three steps the app could have done for them. The same instinct as
  ADR-001, applied to the interface rather than the network.

### Verified

- `format:check`, `lint`, `typecheck`, **147 tests**, `build` all pass
- The six-step journey end to end in a real browser: pick Tailandia → paste `฿1.890` → **49,12 €**,
  rate line and update time present, swap in one tap moves the country selector to 🇪🇸 España
- Skeleton, offline banner, and error state all render; error state contains zero fabricated rates
- 320px / 390px / 768px: no overflow, no sub-44px target, no unnamed button, no console errors

---

### Added — Phase 4: The Conversion Screen (MVP)

PriceLens now converts prices. The first usable MVP.

- **Conversion engine** (`lib/currency/`) — separator-tolerant parsing, triangulated conversion, and
  currency-aware formatting. Pure, framework-free, and exhaustively unit-tested against every edge
  case in `PRODUCT_REQUIREMENTS.md` §7.
- **Live rate provider** (`services/rates/exchangerate-api.ts`) with strict payload validation, plus
  a provider chain that reports which providers were tried and why they failed.
- **`/api/rates`** route handler — server-side proxy with Next's Data Cache, one upstream call per
  hour per deployment.
- **Hooks** — `useRates`, `useLocalStorage` (built on `useSyncExternalStore`), `useOnlineStatus`.
- **The converter UI** — amount field with the currency symbol inline, searchable currency pickers,
  one-tap swap, the result as the visual centre, the effective rate, and rate freshness.
- **Home currency restored from `localStorage`** on load; corrupt values fall back to the default.
- **52 new tests** (128 total), including 18 end-to-end flow tests for the screen.

### Changed

- **`PROVIDER_CHAIN` no longer ends in a bundled-snapshot provider** (ADR-013, below). The fixture
  provider described in Phase 1 was never built.
- `RateTable` moved to `types/` so pure `lib/` code can use it without crossing a layer boundary.
- `Select` gained `isCompact` for narrow placements, where a truncated description ("THB b…") reads
  as broken rather than abbreviated.

### Decisions recorded

- **ADR-013 — No bundled fallback rates; fail honestly instead.** Supersedes the fixture element of
  ADR-002. We have no source of real rate data at build time, so any committed table would be
  invented numbers — and to a traveler deciding whether to spend money they would look exactly like
  fetched ones. Labelling them "approximate" does not help: the decision is made before the caption
  is read. Offline continuity comes from the service worker replaying rates the user genuinely
  received; with none, the UI says so and offers a retry.

### Fixed

- **The currency picker rendered 77px off-screen** on a 390px viewport. Both flex children carried
  `w-full`, and a flex item's default `min-width: auto` stopped the amount field from shrinking.
  Found by measuring the DOM in a real browser — jsdom has no layout engine, so all 18 flow tests
  passed while the screen was visibly broken.

### Verified

- `format:check`, `lint`, `typecheck`, **128 tests**, `build` all pass
- Real browser, iPhone 13 viewport: ฿1,890 → **49,12 €** (arithmetically correct), rate line and
  freshness present, swap works, home currency restored from `localStorage`
- **Recompute-to-paint measured at 11.2ms**, inside the one-frame budget FR-3 asks for
- Error state renders with a retry and **zero fabricated rate lines**
- No horizontal overflow and no sub-44px targets at 320px; no console errors

---

### Added — Phase 3: Design System

Six reusable primitives in `components/ui/`, plus the tokens they are built from. No conversion
screen — that is Phase 4.

- **`Button`** — 3 variants × 2 sizes, loading state that preserves both the accessible name and the
  button's width
- **`IconButton`** — 44px circle with a type-level required `label`
- **`Input`** — associated label, `hint` via `aria-describedby`, leading/trailing slots
- **`Select`** — searchable combobox with full keyboard support, `aria-activedescendant`,
  accent-insensitive search, and a bottom-sheet presentation on phones
- **`Card`**, **`Skeleton`**
- **`/design-system`** — internal gallery rendering every primitive in every state (`noindex`)
- **32 new component tests** (56 total), covering keyboard navigation, ARIA wiring, and focus return

### Changed

- **Spacing is now an 8-point grid**, enforced by setting Tailwind's `--spacing` to `0.5rem` rather
  than by convention. Supersedes the 4px base scale specified in Phase 1. Note the numeric utilities
  are 8px units — `p-4` is 32px.
- **Five colour tokens corrected** after a measured contrast audit (see Fixed).
- Field boundaries are drawn with a `ring` rather than a `border`, because a border consumes 2px of
  the row's content box and drops the target below 44px.

### Fixed

Three defects found by verification rather than by review:

- **Contrast: 5 of 17 token pairs failed WCAG AA.** `success-600` (3.77:1) and `warning-600`
  (3.19:1) were unusable as text; secondary text on the field fill was 4.34:1; the placeholder was
  2.34:1; and the field boundary was 1.23:1 — meaning nothing on screen identified a text field as a
  control, against WCAG 1.4.11. All five corrected; all 17 pairs now measured and passing.
- **The amount field rendered 40px tall** inside its 44px row, missing the touch-target floor. The
  input now stretches to fill the row.
- **Horizontal overflow at 320px** on the gallery, caused by writing `w-40` with stock-Tailwind
  reflexes under the new 8px base (320px, not 160px). Fixed — and a useful demonstration that the
  grid constraint actually binds.

### Decisions recorded

- **ADR-011** — `clsx` + `tailwind-merge` for class composition. Not cosmetic: Tailwind's fixed
  stylesheet order makes caller overrides unpredictable without conflict resolution.
- **ADR-012** — Capture readiness through existing slots rather than scaffolding. The seam is
  exercised and tested today; no OCR code exists.

### Verified

- `format:check`, `lint`, `typecheck`, **56 tests**, `build` all pass
- Automated in-browser checks at iPhone 13: no interactive element under 44px, no button without an
  accessible name, no console errors, no horizontal overflow at 320px
- `Select` confirmed to render as a bottom sheet anchored to the viewport bottom on phones and as an
  anchored dropdown at ≥640px; accent-insensitive search and keyboard selection confirmed end to end

---

### Added — Phase 2: Project Foundation

Working Next.js application scaffold. No converter UI yet — that is Phase 4.

- **Next.js 16.2.12** (App Router, Turbopack) + React 19.2, TypeScript 6.0.3, Tailwind CSS 4.3
- **Tailwind `@theme` token block** implementing `DESIGN_SYSTEM.md` in `app/globals.css`. In Tailwind
  4 this block _is_ the framework configuration, which is why it belongs to setup rather than to
  component work.
- **Progressive Web App**: manifest generated from config, a hand-written runtime-caching service
  worker, and a generated icon set (192/512/maskable/apple-touch)
- **Centralised configuration** in `config/` — app settings, 156 currencies, feature flags, locales,
  and the provider registry, with unit-tested invariants
- **Provider abstraction** (`services/rates/types.ts`): the `RateProvider` contract and
  `RateSnapshot` shape. Implementations land in Phase 4
- **Internationalisation** via next-intl, Spanish catalogue, no hardcoded UI strings
- **Tooling**: ESLint with type-aware rules _and_ per-directory import rules that enforce the
  architecture boundaries, Prettier, Vitest + Testing Library
- **CI** (`.github/workflows/ci.yml`): format, lint, typecheck, test, build as separate named gates
- **Generators** in `scripts/` for the currency table and icons, both deterministic

### Changed

- **PWA moved from V2 into V1.** Offline capability is not a comfort feature for a travel product —
  a failed connection is the primary scenario. Recorded as ADR-007.
- **UI language is Spanish**, on a locale-agnostic foundation (ADR-009). Supersedes the earlier note
  that V1 copy would be English.
- **ADR-004 broadened** from "pin TypeScript" to "pin the toolchain to what the ecosystem supports."

### Fixed

- **Corrected the ESLint version recorded in Phase 1.** `ARCHITECTURE.md` listed ESLint `10.x` on the
  strength of the registry's `latest` tag. In practice ESLint 10.8.0 installs cleanly and then throws
  at lint time — `eslint-plugin-react@7.37.5`, a transitive dependency of `eslint-config-next`, calls
  a rule-context API that ESLint 10 removed. Pinned to `9.39.x`, which lints clean. The Phase 1 claim
  was based on registry metadata rather than on running the tool; ADR-004 now says to run it.

### Decisions recorded

- **ADR-007** — Hand-written runtime-caching service worker instead of Serwist or next-pwa. Runtime
  caching removes the hard part (precaching hashed assets), and a worker with no build integration
  cannot break a Turbopack build.
- **ADR-008** — Centralised configuration in `config/`, kept free of app imports so any layer can use
  it, and testable as data.
- **ADR-009** — next-intl over a hand-rolled dictionary: ICU plural rules for rate freshness are
  exactly the kind of thing not worth reimplementing.
- **ADR-010** — Structural readiness for OCR, AI, and native apps, with no speculative abstractions.
  The claim is checkable: if `lib/` imports React, lint fails.

### Verified

- `pnpm format:check && lint && typecheck && test && build` all pass; 24 tests
- Real-browser check at iPhone 13 viewport: service worker reaches `active`, and the app still
  renders **with the network disabled**
- No horizontal overflow at 320px; `<html lang="es">`; manifest and `sw.js` served with correct
  headers
- Both generators reproduce their committed output byte-for-byte

---

### Added — Phase 1: Documentation & Architecture

Foundation documentation set. No application code in this phase.

- `docs/PROJECT_BIBLE.md` — mission, vision, values, the 3-second promise, product/design/technical
  philosophy, engineering rules, scope discipline
- `docs/PRODUCT_REQUIREMENTS.md` — problem, target user, V1 scope, functional and non-functional
  requirements, 14 edge cases, success criteria
- `docs/ARCHITECTURE.md` — system design, layer boundaries, folder structure, rate service design,
  error/degradation strategy, testing strategy, ADRs 001–006
- `docs/DESIGN_SYSTEM.md` — design tokens, typography scale, component inventory, responsive layout,
  accessibility and motion rules
- `docs/ROADMAP.md` — V1 through V5 with rationale and prerequisites, plus permanent non-goals
- `docs/CONTRIBUTING.md` — setup, branching, commit conventions, code standards, definition of done
- `docs/CHANGELOG.md` — this file

### Decisions recorded

- **ADR-001** — One rate table fetched per session, all pairs derived by local triangulation. Keeps
  the network out of the keystroke loop, which is what makes the 3-second promise architectural
  rather than aspirational.
- **ADR-002** — ExchangeRate-API keyless endpoint as the primary provider, chosen over Frankfurter
  for travel-currency coverage (VND, AED, EGP and most Asian/Middle Eastern currencies). Zero
  required environment variables.
- **ADR-003** — No data-fetching library. One request per session does not justify a permanent
  dependency against a 100KB budget.
- **ADR-004** — TypeScript pinned to `^6.0.3` rather than `latest` (`7.0.2`), because
  `typescript-eslint@8.65.0` peer-requires `<6.1.0`. Taking "latest" would have silently broken
  type-aware linting on day one.
- **ADR-005** — `localStorage` for the home currency only. The exact boundary against the V1
  no-persistence rule is written down so it cannot be widened by precedent.
- **ADR-006** — Currency-aware rounding using real minor-unit digits, not a hardcoded two decimals.

### Notes

- Verified toolchain versions at time of writing: `next@16.2.12`, `react@19.2.8`,
  `tailwindcss@4.3.3`, `eslint@10.8.0`, `prettier@3.9.6`, `vitest@4.1.10`. (The ESLint version was
  later corrected to `9.39.x` in Phase 2 — see Fixed, above.)
- Tailwind 4 is CSS-first — design tokens live in an `@theme` block in `app/globals.css`, and there
  is no `tailwind.config.js`.
- `next/font/google` self-hosts Inter at build time and requires build-time network access. Where
  that is unavailable, the documented fallback is the Inter-first system stack already declared
  behind the `--font-sans` variable — a one-line swap in `layout.tsx`.

---

## Release History

_No releases yet. V1 targets `0.1.0` on completion of Phase 4._
