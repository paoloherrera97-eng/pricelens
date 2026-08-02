# Changelog

All notable changes to PriceLens are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

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
  `tailwindcss@4.3.3`, `eslint@10.8.0`, `prettier@3.9.6`, `vitest@4.1.10`.
- Tailwind 4 is CSS-first — design tokens live in an `@theme` block in `app/globals.css`, and there
  is no `tailwind.config.js`.
- `next/font/google` self-hosts Inter at build time and requires build-time network access. Where
  that is unavailable, the documented fallback is the Inter-first system stack already declared
  behind the `--font-sans` variable — a one-line swap in `layout.tsx`.

---

## Release History

_No releases yet. V1 targets `0.1.0` on completion of Phase 4._
