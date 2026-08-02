# PriceLens — Project Bible

> The document every other document defers to. When `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, or a code
> review disagrees with this file, this file wins — or this file gets deliberately amended. It is
> never silently overruled.

---

## Mission

**Help travelers instantly understand the real value of prices in their own currency.**

## Vision

A traveler anywhere in the world sees a price tag they don't understand, opens PriceLens, and knows
what it means to _them_ — before they've finished reading the tag.

Long term, PriceLens becomes the layer between a traveler and every foreign price they encounter:
menus, taxis, market stalls, hotel bills. The conversion is the entry point, not the destination.

## The 3-Second Promise

**A user must understand a foreign price in under 3 seconds.**

This is the product's single measurable promise and its primary design constraint. It is not a
marketing line — it is an engineering requirement with architectural consequences:

- The result is visible without a submit button, a modal, or a page transition.
- Typing a digit updates the answer immediately — no network round-trip per keystroke
  (see ADR-001 in `ARCHITECTURE.md`).
- The app is usable on a bad connection, because bad connections are the normal condition of
  travel, not the exception.
- The answer is the largest thing on screen. Everything else is subordinate to it.

Any change that adds latency, taps, or cognitive load between "user has a price" and "user
understands the price" is a regression, regardless of what it adds elsewhere.

---

## What PriceLens Is Not

**PriceLens is not a currency converter.** It is a travel shopping assistant.

The distinction is not semantic — it decides what we build:

| A currency converter would…              | PriceLens instead…                                        |
| ---------------------------------------- | --------------------------------------------------------- |
| Offer every currency pair equally        | Optimizes for the pair a traveler is actually standing in |
| Show a rate                              | Shows a **price the user understands**                    |
| Add charts, historical data, rate alerts | Removes anything that isn't the answer                    |
| Serve finance users and travelers alike  | Serves the traveler holding a price tag                   |

We are competing with the traveler's own mental arithmetic, not with financial tools.

---

## Values

1. **Clarity over cleverness.** If a feature needs explaining, it has already failed.
2. **Speed is a feature.** Latency is the product's main competitor.
3. **Trust is earned in the details.** A wrong rate, a mis-rounded yen, or a stale figure presented
   as fresh destroys more value than a missing feature ever could.
4. **Honesty about uncertainty.** When rates are stale or the provider is down, we say so plainly.
   We never present degraded data as if it were live.
5. **Restraint.** The hardest engineering decision on this project will consistently be what to
   leave out.

---

## Product Philosophy

Every proposed feature must answer one question:

> **"Does this help travelers understand prices faster?"**

If the answer is no, or "not directly," it does not get built — no matter how good the idea is on
its own merits. Good ideas that fail this test go to `ROADMAP.md` for a future version where the
question may be answered differently.

Corollaries:

- **Defaults beat settings.** Every preference we add is a decision we failed to make for the user.
- **The empty state is the product.** Most sessions are short and start cold. First paint matters
  more than any flow.
- **One screen.** V1 has no navigation, because navigation implies the user must find something.

---

## Design Philosophy

Inspiration: **Apple, Linear, Stripe, Wise, Revolut.**

What we take from them is not a visual style but a shared discipline: generous space, few elements,
strong hierarchy, and typography doing most of the work.

- **Minimal, premium, elegant.** Rounded corners, large spacing, professional typography.
- **One thing dominates.** The converted amount is the visual center of gravity; everything else
  recedes.
- **Restrained color.** Blue for primary, neutrals for structure, green and red reserved for
  meaning — never decoration. A color that carries no meaning does not belong on the screen.
- **Touch-first.** Designed for a thumb on a phone in bright sunlight, not a mouse at a desk.
- **Accessible by default.** WCAG 2.2 AA is a baseline, not a milestone. Contrast, focus states, and
  labels are part of "done," not a follow-up ticket.

Full token definitions live in `DESIGN_SYSTEM.md`.

---

## Technical Philosophy

**Write code as if another senior engineer will maintain it** — because one will.

- **Simplicity, maintainability, clarity, scalability, modularity, reusability** — in that order
  when they conflict.
- **Never duplicate logic.** Conversion math exists in exactly one place. Formatting exists in
  exactly one place.
- **Boundaries are deliberate.** UI does not fetch. Services do not format. Pure logic does not know
  React exists. This is what makes the code testable without a browser.
- **Dependencies are liabilities.** Every package added is a package maintained, audited, and
  upgraded for years. The bar for adding one is: _this is meaningfully hard to do correctly
  ourselves._ A single HTTP request does not clear that bar.
- **Decisions are documented, not remembered.** Anything non-obvious becomes an ADR. Code explains
  _how_; ADRs explain _why_, which is the part that gets lost.
- **No fake implementations.** No placeholder architecture, no mocked-out "coming soon" internals.
  If it ships, it works.

---

## Engineering Rules

These are enforced in review. They are not suggestions.

1. **TypeScript strict mode. No `any`.** If a type is genuinely unknown, it is `unknown` and gets
   narrowed.
2. **Pure logic is pure.** Everything in `lib/` is a pure function: no fetch, no DOM, no React, no
   module-level clock or randomness. This makes it trivially testable.
3. **One source of truth per concept.** Currency metadata, conversion math, and formatting each have
   exactly one home.
4. **Money is never a naked `number` passed between layers.** Amounts travel with their currency
   code, and rounding always respects the currency's real minor-unit digits (JPY has 0, KWD has 3).
   See ADR-006.
5. **Every user-visible failure has a designed state.** Loading, empty, error, offline, and stale
   are designed and implemented — not left to whatever React renders by accident.
6. **Components are dumb by default.** Data fetching lives in hooks; presentation components receive
   props and render.
7. **Tests cover the math and the money.** Conversion, parsing, and formatting are unit-tested
   without exception. UI tests cover the primary conversion flow.
8. **Accessibility is part of the definition of done.** Keyboard-operable, labeled, and
   contrast-checked before a PR is opened.
9. **The build must be green.** `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all
   pass before merge. A red main branch is an incident.
10. **No secrets in the client.** Anything resembling a credential lives server-side, behind a route
    handler.

---

## Scope Discipline

### V1 MVP includes exactly

Manual amount input · currency selector · home currency selector · live exchange rates · a beautiful
conversion result · responsive, mobile-first interface · fast loading · clean UI · an installable,
offline-capable PWA · a Spanish UI built on an internationalisation-ready foundation.

### V1 explicitly excludes

Authentication · database · user accounts · payments · notifications · ads · OCR · camera · history ·
dark mode · AI.

These exclusions are **decisions, not omissions.** They are not bugs, they are not oversights, and
they are not to be quietly reintroduced because they were easy. Each has a home in `ROADMAP.md`.

**One deliberate, documented exception:** the user's home currency is remembered in `localStorage`.
This is a single string, not a database, an account, or a history. It exists because re-selecting
your home currency on every visit is a direct tax on the 3-second promise. The precise boundary is
recorded in ADR-005.

---

## Roadmap Summary

Detail and rationale live in `ROADMAP.md`.

| Version | Theme                                                                       |
| ------- | --------------------------------------------------------------------------- |
| **V1**  | The 3-second conversion. One screen, done exceptionally well.               |
| **V2**  | Comfort — recent currencies, dark mode, offline rate packs.                 |
| **V3**  | Capture — camera and OCR. Point at a price tag instead of typing it.        |
| **V4**  | Context — "is this expensive _here_?" Turning a number into a judgment.     |
| **V5**  | Continuity — accounts and sync, only once there is something worth syncing. |

The ordering reflects a principle: **we earn the right to add complexity by first proving the simple
thing works.**

---

## Definition of Success

V1 succeeds if a traveler can open the app cold, on hotel Wi-Fi, and understand a foreign price in
under 3 seconds — and trust the number they see.

Nothing else in V1 matters more than that sentence.
