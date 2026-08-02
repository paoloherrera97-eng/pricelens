# PriceLens — Design System

**Status:** Approved for build · **Applies to:** V1 MVP

The source of truth for every visual decision. Tokens defined here are implemented verbatim in the
Tailwind 4 `@theme` block in `app/globals.css` — that block and this document must never disagree.

---

## 1. Principles

Inspiration: **Apple, Linear, Stripe, Wise, Revolut.** What we borrow is discipline, not decoration.

1. **One thing dominates.** The converted amount is the visual center of gravity. If your eye lands
   anywhere else first, the screen is wrong.
2. **Space is the primary design tool.** Before adding a border, a background, or a divider, try
   more space. It usually wins.
3. **Typography carries the hierarchy.** Size and weight do the work that color and boxes do in
   lesser interfaces.
4. **Color means something or it isn't there.** Blue is action, green is confirmation, red is
   failure. There is no decorative color.
5. **Designed for a thumb.** One-handed, on a phone, outdoors, possibly in a hurry.
6. **Accessible by default.** Contrast and focus states are part of the design, not a remediation
   pass afterward.

---

## 2. Color

Deliberately narrow. Blue, neutrals, and two semantic colors — nothing else.

### Primary — Blue

| Token                 | Value     | Use                               |
| --------------------- | --------- | --------------------------------- |
| `--color-primary-50`  | `#EFF6FF` | Tinted surfaces, subtle highlight |
| `--color-primary-100` | `#DBEAFE` | Hover on tinted surfaces          |
| `--color-primary-500` | `#3B82F6` | Accents, focus ring               |
| `--color-primary-600` | `#2563EB` | **Primary actions, key emphasis** |
| `--color-primary-700` | `#1D4ED8` | Pressed / active                  |

`primary-600` on white gives 5.17:1 — passes AA for normal text. `primary-500` is used for focus
rings and large text only, never small body copy on white.

### Neutral

| Token                 | Value     | Use                                   |
| --------------------- | --------- | ------------------------------------- |
| `--color-white`       | `#FFFFFF` | Page and card background              |
| `--color-neutral-50`  | `#F8FAFC` | App background behind cards           |
| `--color-neutral-100` | `#F1F5F9` | Input backgrounds, dividers           |
| `--color-neutral-200` | `#E2E8F0` | Borders                               |
| `--color-neutral-400` | `#94A3B8` | Placeholder, disabled text            |
| `--color-neutral-500` | `#64748B` | Secondary text (4.76:1 on white — AA) |
| `--color-neutral-700` | `#334155` | Body text                             |
| `--color-neutral-900` | `#0F172A` | **Headings and the result amount**    |

### Semantic

| Token                 | Value     | Use                        |
| --------------------- | --------- | -------------------------- |
| `--color-success-600` | `#059669` | Fresh rates, confirmation  |
| `--color-success-50`  | `#ECFDF5` | Success surface            |
| `--color-danger-600`  | `#DC2626` | Errors, failure states     |
| `--color-danger-50`   | `#FEF2F2` | Error surface              |
| `--color-warning-600` | `#D97706` | **Stale / degraded rates** |
| `--color-warning-50`  | `#FFFBEB` | Degraded-state surface     |

Warning is the one addition beyond the specified palette, and it earns its place: PRD FR-5 requires
that stale and fallback rates are visibly distinguished from fresh ones. Using red would imply
failure when the app is working correctly; using green would misrepresent stale data as current.
Amber is the honest signal, and honesty about data quality is Value #4 in the Project Bible.

**Dark mode is out of scope for V1** — but every color above is declared as a CSS custom property,
so V2 adds a palette rather than a refactor.

---

## 3. Typography

**Inter** — a modern, highly legible UI typeface with excellent tabular figures, which matters here
because we render numbers that must not shift width while typing.

```
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Loading strategy

**Preferred:** `next/font/google` — self-hosts Inter at build time, so there is no runtime request
to Google, no layout shift, and no third-party dependency in the critical path (which also keeps our
privacy promise in PRD §6 intact).

**Documented fallback:** the build machine must reach Google Fonts _at build time_. In restricted
network environments this step fails. If it does, ship the stack above unchanged — Inter renders for
users who have it, and the system UI font is a close metrical match for everyone else. The swap is
one line in `layout.tsx`; the `--font-sans` variable is the seam that makes it one line.

### Scale

| Token               | Size / Line height | Weight | Use                             |
| ------------------- | ------------------ | ------ | ------------------------------- |
| `--text-display`    | `3.5rem / 1.05`    | 700    | **The conversion result**       |
| `--text-display-sm` | `2.5rem / 1.1`     | 700    | The result at ≤ 375px           |
| `--text-2xl`        | `1.5rem / 1.3`     | 600    | Page title                      |
| `--text-lg`         | `1.125rem / 1.5`   | 500    | Amount input, selected currency |
| `--text-base`       | `1rem / 1.5`       | 400    | Body                            |
| `--text-sm`         | `0.875rem / 1.45`  | 400    | Labels, secondary rate line     |
| `--text-xs`         | `0.75rem / 1.4`    | 500    | Freshness timestamp, captions   |

**Rules**

- The result uses **tabular figures** (`font-variant-numeric: tabular-nums`). Without this, digits
  change width as the user types and the number visibly jitters — a small detail that reads as
  cheapness.
- The amount input is minimum `1rem` on mobile. Anything smaller triggers iOS Safari's automatic
  zoom-on-focus, which yanks the user out of the layout.
- Body text never goes below `0.75rem`.

---

## 4. Spacing

A 4px base scale. Generous by default — space is the primary tool (Principle 2).

| Token        | Value            |
| ------------ | ---------------- |
| `--space-1`  | `0.25rem` (4px)  |
| `--space-2`  | `0.5rem` (8px)   |
| `--space-3`  | `0.75rem` (12px) |
| `--space-4`  | `1rem` (16px)    |
| `--space-6`  | `1.5rem` (24px)  |
| `--space-8`  | `2rem` (32px)    |
| `--space-12` | `3rem` (48px)    |
| `--space-16` | `4rem` (64px)    |

Screen gutter: `--space-4` on mobile, `--space-8` from `md` upward. Vertical rhythm between major
blocks: `--space-8`.

---

## 5. Radius and Elevation

| Token           | Value            | Use                     |
| --------------- | ---------------- | ----------------------- |
| `--radius-md`   | `0.75rem` (12px) | Inputs, selectors       |
| `--radius-lg`   | `1rem` (16px)    | Buttons                 |
| `--radius-xl`   | `1.5rem` (24px)  | Cards, the result panel |
| `--radius-full` | `9999px`         | Swap button, pills      |

Elevation is restrained — depth comes from space and hierarchy, not shadow stacking.

| Token         | Value                              | Use               |
| ------------- | ---------------------------------- | ----------------- |
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.04)`   | Resting inputs    |
| `--shadow-md` | `0 4px 12px rgb(15 23 42 / 0.06)`  | Cards             |
| `--shadow-lg` | `0 12px 32px rgb(15 23 42 / 0.10)` | Selector dropdown |

---

## 6. Component Inventory

Every component below must implement **every state listed**. A component without its error and
disabled states is not finished.

### `Button`

- **Variants:** `primary` (filled blue), `secondary` (neutral surface), `ghost` (transparent).
- **States:** default · hover · active · focus-visible · disabled · loading.
- **Sizes:** `md` (44px), `lg` (52px). Minimum height is never below 44px.

### `Input` (amount)

- Left-aligned currency symbol, large tabular value.
- `inputmode="decimal"` so phones open the numeric keypad.
- **States:** default · focus · filled · disabled. Invalid characters are silently ignored rather
  than producing an error state (PRD FR-1) — the component has no error variant by design.

### `Select` (currency picker)

- Searchable listbox filtering on code, name, and country.
- Each row: code (medium weight) · name · symbol, in that reading order.
- **States:** closed · open · searching · no-results · disabled · focused-option.
- Built on native semantics with `role="listbox"` / `role="option"`, `aria-activedescendant`, and
  full keyboard support: ↑ ↓ Home End Enter Esc, plus type-ahead.

### `Card`

- White surface, `--radius-xl`, `--shadow-md`. The structural container for the converter.

### `Skeleton`

- Neutral shimmer occupying the exact final dimensions of its content. Prevents layout shift while
  the rate table loads (PRD FR-5).

### `ConversionResult`

- The centerpiece. `--text-display`, `--color-neutral-900`, tabular figures.
- Secondary line showing the effective rate, at `--text-sm` in `--color-neutral-500`.
- Wrapped in `aria-live="polite"` so screen-reader users hear the updated result without the region
  interrupting their typing.

### `RateFreshness`

- Three visual states mapping to PRD FR-5: **fresh** (green dot, relative timestamp), **stale**
  (amber dot, explicit note), **degraded/offline** (amber dot, "approximate rates from <date>").
- Never uses red — degraded rates are a working state, not an error.

---

## 7. Layout and Responsive

**Mobile-first.** The mobile layout is the design; desktop is the adaptation.

| Breakpoint | Width   | Behavior                                                |
| ---------- | ------- | ------------------------------------------------------- |
| base       | 320px+  | Single column, full-width controls, `--text-display-sm` |
| `sm`       | 640px+  | Full display size, wider gutters                        |
| `md`       | 768px+  | Card max-width `28rem`, vertically centered             |
| `lg`       | 1024px+ | Unchanged card, more surrounding space                  |

The card never exceeds `28rem`. A conversion widened across a 1440px monitor looks like a form; kept
narrow, it looks like an answer.

**Vertical order (mobile):** title → amount input + source currency → swap → target currency →
**result** → freshness.

---

## 8. Accessibility

Non-negotiable, and part of the definition of done.

- **Contrast:** ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries and focus indicators. Every token pairing
  in §2 has been chosen against this.
- **Touch targets:** ≥ 44×44px, with ≥ 8px between adjacent targets.
- **Focus:** a visible `2px` `--color-primary-500` ring at `2px` offset on every interactive element.
  Focus indicators are never removed — `outline: none` without a replacement is a review blocker.
- **Labels:** every control has a programmatic label. Placeholder text is never the only label.
- **Live region:** the result is announced politely on change.
- **Motion:** all transitions respect `prefers-reduced-motion: reduce`.
- **Zoom:** layout holds at 200% zoom without horizontal scrolling.

---

## 9. Motion

Motion confirms causality. It never entertains.

| Token             | Value                           | Use                          |
| ----------------- | ------------------------------- | ---------------------------- |
| `--duration-fast` | `120ms`                         | Hover, focus                 |
| `--duration-base` | `200ms`                         | Dropdown open, swap rotation |
| `--ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)` | Default easing               |

**The conversion result never animates its value.** Counting-up digits would directly violate the
3-second promise — it delays comprehension in exchange for a flourish. The number simply is what it
is, immediately.

Under `prefers-reduced-motion: reduce`, all transitions collapse to `0ms`.

---

## 10. Implementation Note (Tailwind 4)

Tailwind 4 is CSS-first: **there is no `tailwind.config.js`.** Tokens are declared in `@theme` inside
`app/globals.css`, which generates the corresponding utilities automatically:

```css
@import 'tailwindcss';

@theme {
  --color-primary-600: #2563eb;
  --color-neutral-900: #0f172a;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --radius-xl: 1.5rem;
  /* …full token set from this document… */
}
```

This file is the single implementation of this document. Hardcoded hex values, arbitrary
`text-[13px]` values, or one-off shadows anywhere in `components/` are review blockers — if a value
is needed and missing, it gets added here first.
