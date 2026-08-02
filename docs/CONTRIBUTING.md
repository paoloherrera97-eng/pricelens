# Contributing to PriceLens

Written for the next senior engineer on this project — including future us, who will not remember
any of this.

---

## Before You Write Code

Read `PROJECT_BIBLE.md`. It takes five minutes and it explains the decisions that the code cannot.

Then check your change against the product question:

> **Does this help travelers understand prices faster?**

If it doesn't, it probably belongs in `ROADMAP.md` rather than in this PR. That is not a rejection —
scope discipline is the main thing protecting this product.

---

## Local Setup

**Requires** Node.js 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

There are **no environment variables to configure.** The app runs fully with a fresh clone — a
deliberate consequence of ADR-002 (keyless rate provider). If you ever find yourself adding a
required env var to make the app boot, that is an architectural decision needing an ADR, not a
config change.

**Working without network access:** the app falls back to bundled snapshot rates and renders a
labeled degraded state. Everything except live rates works offline, and the entire test suite runs
without network by design.

### Scripts

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Development server                            |
| `pnpm build`        | Production build                              |
| `pnpm start`        | Serve the production build                    |
| `pnpm lint`         | ESLint, including type-aware + boundary rules |
| `pnpm typecheck`    | `tsc --noEmit`                                |
| `pnpm test`         | Vitest, single run                            |
| `pnpm test:watch`   | Vitest, watch mode                            |
| `pnpm format`       | Prettier write                                |
| `pnpm format:check` | Prettier check (CI)                           |
| `pnpm verify`       | All gates, in the order CI runs them          |

**The service worker only registers in production builds.** `pnpm dev` deliberately skips it — a
worker caching development assets across a rebuild produces bugs that look like application faults.
To exercise PWA behaviour, run `pnpm build && pnpm start`.

### Generated files

Two files are generated and committed. Never hand-edit them; change the generator and re-run:

```bash
node scripts/generate-currencies.mjs   # → config/currencies.ts (ICU/CLDR data)
node scripts/generate-icons.mjs        # → public/icons/*.png
pnpm format                            # normalise the generated TypeScript
```

Both are deterministic and reproduce their committed output byte-for-byte, so an unexpected diff
after regeneration means the underlying ICU data changed — which is information worth reading, not
noise to commit past.

---

## Branching

```
main                          Always deployable. Protected.
claude/<topic>                Agent-authored work
feat/<short-description>      Features
fix/<short-description>       Bug fixes
docs/<short-description>      Documentation
chore/<short-description>     Tooling, dependencies
```

Branch from `main`. Keep branches short-lived — a branch open for two weeks is a merge conflict
wearing a disguise.

---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

feat(converter): add swap direction button
fix(format): round JPY to zero decimal places
docs(architecture): record ADR-006 on currency-aware rounding
```

Types: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

**Write the subject so it completes the sentence "this commit will…"** in the imperative mood. The
body explains _why_, not _what_ — the diff already shows what.

---

## Code Standards

These are enforced in review, not aspirational. They restate the engineering rules from
`PROJECT_BIBLE.md` in operational terms.

### TypeScript

- Strict mode. **No `any`** — use `unknown` and narrow it.
- Prefer `type` for unions and object shapes; `interface` for contracts meant to be implemented
  (e.g. `RateProvider`).
- Export types from `types/` when shared; keep them local when they aren't.
- Never assert with `as` to silence an error. If a type is wrong, fix the type.

### Architecture boundaries

Dependencies point downward only. **These are enforced by ESLint**, so a violation fails `pnpm lint`
rather than waiting for a reviewer to notice:

- `lib/` imports **nothing** from `app/`, `components/`, `hooks/`, or `services/`. Everything in
  `lib/` is a pure function of its arguments — no fetch, no DOM, no React, no module-scope clock or
  randomness. This is what makes the domain logic testable in milliseconds, and what would let a
  future native client reuse it unchanged (ADR-010).
- `components/` never calls `fetch` and never imports from `services/`. Data arrives via props or a
  hook.
- `services/` never imports React.
- `config/` imports nothing from the app, which is why anything may import it.

### Configuration

No magic literals. Currencies, providers, feature flags, locales, cache windows, and storage keys
belong in `config/` (ADR-008). If you find yourself typing a constant into a component, it belongs
one directory over.

### Copy and i18n

**No user-facing string is hardcoded.** All copy lives in `messages/es.json` and is reached through
next-intl (ADR-009). Adding a string means adding a key; a missing key in any locale fails the test
suite rather than reaching a user.

Format numbers and currencies through `Intl` with an explicit locale — never with string
concatenation or a hardcoded symbol position, both of which are wrong in some locale.

### Components

- One component per file, named the same as the file.
- Presentation components take props and render. Data fetching and state live in hooks.
- Props interfaces are explicit — no `React.FC`, no implicit `any` props.
- If a component exceeds ~150 lines, it is doing more than one job.

### Styling

- Tailwind utilities only, from tokens defined in `DESIGN_SYSTEM.md`.
- **No hardcoded values.** No `text-[13px]`, no inline hex, no one-off shadows. If a value is
  missing, add it to the `@theme` block in `app/globals.css` and document it in `DESIGN_SYSTEM.md`
  first.
- Mobile-first: unprefixed utilities are the mobile design; `sm:` / `md:` are adaptations.

### Money

- Amounts never travel between layers as a naked `number` — they carry their currency code.
- Rounding respects the currency's real minor-unit digits (ADR-006). Never hardcode `toFixed(2)`.
- Rounding happens once, at display time. Never mid-calculation.

### Naming

- Booleans read as assertions: `isLoading`, `hasError`, `isDegraded`.
- Handlers are `handleX` in the component, `onX` in the props interface.
- No abbreviations except the genuinely universal (`id`, `url`, `api`).

---

## Testing

New logic in `lib/` or `services/` ships with tests. This is not negotiable — it is the money math.

- **`lib/`** — exhaustive unit tests. Cover the edge cases in `PRODUCT_REQUIREMENTS.md` §7,
  particularly zero-decimal currencies (JPY), three-decimal currencies (KWD), sub-cent results, and
  separator-tolerant parsing.
- **`services/`** — malformed payloads, provider failure, fallback chain ordering.
- **`components/`** — the primary conversion flow, swap behavior, and accessibility roles/labels.

**Tests never touch the network.** Provider responses are fixtures. A test that needs network access
is a test that will fail in CI and be quietly disabled six months from now.

Query by accessible role and label (`getByRole`, `getByLabelText`) rather than by test id. If a
query is hard to write, the accessibility is usually the actual problem.

---

## Accessibility

Part of the definition of done, not a follow-up ticket.

Before opening a PR that touches UI:

- [ ] Operable with keyboard alone, in a sensible tab order
- [ ] Visible focus indicator on every interactive element — `outline: none` without a replacement
      is a blocker
- [ ] Every control has a programmatic label; placeholders are never the only label
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries
- [ ] Touch targets ≥ 44×44px
- [ ] Layout holds at 200% zoom without horizontal scrolling
- [ ] Motion respects `prefers-reduced-motion`

---

## Pull Requests

**Before opening:**

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

All four must pass. A red `main` is an incident, and the cheapest place to prevent it is here.

**PR description should cover:**

- What changed and why
- Which requirement or ADR it relates to
- Screenshots or a recording for UI changes — mobile viewport first
- Anything you decided _not_ to do, and why

**Keep PRs small.** A 200-line PR gets a real review; a 2,000-line PR gets an approval.

---

## Definition of Done

A change is done when:

1. It satisfies its requirement in `PRODUCT_REQUIREMENTS.md`
2. Lint, typecheck, tests, and build all pass
3. New logic has tests, including relevant edge cases
4. UI changes meet the accessibility checklist above
5. UI changes work from 320px upward
6. No new dependency was added without justification in the PR description
7. Non-obvious decisions are recorded — as an ADR in `ARCHITECTURE.md` if architectural
8. `CHANGELOG.md` is updated under `[Unreleased]`
9. The change does not quietly reintroduce something V1 excluded on purpose

---

## Adding a Dependency

The bar is: **this is meaningfully hard to do correctly ourselves.**

Every dependency is one we maintain, audit, and upgrade for years, and one that competes for a 100KB
client-JS budget. In the PR, state what it does, what it weighs, what it would take to write
ourselves, and why that trade favors the dependency. "It's popular" is not an argument. ADR-003
exists as a worked example of declining one.

---

## Changing an Architectural Decision

ADRs in `ARCHITECTURE.md` are not sacred, but they are not silently overridable either. If you
believe one is wrong:

1. Open an issue explaining what changed since it was written
2. If accepted, **add a superseding ADR** — never edit the old one into agreement with the new one

The record of what we believed and why is more valuable than the record being tidy. An ADR you
disagree with is still telling you something true about the moment it was made.
