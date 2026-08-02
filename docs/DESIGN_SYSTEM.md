# PriceLens — Design System

**Status:** Implemented · **Applies to:** V1 · **Themes:** light + dark

The source of truth for every visual decision. Tokens defined here are implemented verbatim in the
Tailwind 4 `@theme` block in `app/globals.css` — that block and this document must never disagree.

Every contrast ratio below is **measured, not estimated**. Five token pairs failed the first audit and
were corrected; the failures and fixes are recorded in §2.

---

## 1. Principles

Inspiration: **Apple, Linear, Stripe, Wise, Revolut.** What we borrow is discipline, not decoration.

1. **One thing dominates.** The converted amount is the visual center of gravity. If your eye lands
   anywhere else first, the screen is wrong.
2. **Space is the primary design tool.** Before adding a border, a background, or a divider, try
   more space. It usually wins.
3. **Typography carries the hierarchy.** Size and weight do the work that color and boxes do in
   lesser interfaces.
4. **Color means something or it isn't there.** Blue is action, green is confirmation, amber is
   stale, red is failure. There is no decorative color.
5. **Designed for a thumb.** One-handed, on a phone, outdoors, possibly in a hurry.
6. **Accessible by default.** Contrast and focus states are part of the design, not a remediation
   pass afterward.

---

## 2. Color

Deliberately narrow: blue, neutrals, and three semantic colors.

### Primary — Blue

| Token                 | Value     | Use                                   |
| --------------------- | --------- | ------------------------------------- |
| `--color-primary-50`  | `#EFF6FF` | Active option, tinted surfaces        |
| `--color-primary-100` | `#DBEAFE` | Hover on tinted surfaces              |
| `--color-primary-500` | `#3B82F6` | Focus ring (3.68:1 on white)          |
| `--color-primary-600` | `#2563EB` | **Primary actions** (5.17:1 on white) |
| `--color-primary-700` | `#1D4ED8` | Pressed / active                      |

### Neutral

| Token                 | Value     | Use                                                     |
| --------------------- | --------- | ------------------------------------------------------- |
| `--color-white`       | `#FFFFFF` | Card surface                                            |
| `--color-neutral-50`  | `#F8FAFC` | App background                                          |
| `--color-neutral-100` | `#F1F5F9` | Field fill                                              |
| `--color-neutral-200` | `#E2E8F0` | Decorative dividers **only** — 1.23:1, never a boundary |
| `--color-neutral-400` | `#94A3B8` | **Disabled text only** — exempt from 1.4.3              |
| `--color-neutral-500` | `#5B6B7F` | Secondary text, placeholders (5.45:1 / 4.97:1 on fill)  |
| `--color-neutral-700` | `#334155` | Body text (10.35:1)                                     |
| `--color-neutral-900` | `#0F172A` | Headings and the result (17.85:1)                       |
| `--color-outline`     | `#828C9C` | Field and trigger boundary (3.40:1) — see below         |

### Semantic

| Token                 | Value     | Use                                 |
| --------------------- | --------- | ----------------------------------- |
| `--color-success-600` | `#047857` | Fresh rates (5.48:1)                |
| `--color-warning-600` | `#B45309` | **Stale / degraded rates** (5.02:1) |
| `--color-danger-600`  | `#DC2626` | Errors (4.83:1)                     |
| `--color-*-50`        | —         | Matching tinted surfaces            |

Amber is the one addition beyond the specified palette, and it earns its place: PRD FR-5 requires
stale and fallback rates to be visibly distinct from fresh ones. Red would imply failure when the app
is working correctly; green would misrepresent stale data as current. Amber is the honest signal.

### What the contrast audit changed

The first audit measured every pair used in the components. **Five failed**, and the palette was
corrected rather than the claim softened:

| Pair                         | Was       | Measured | Now       | Now measures |
| ---------------------------- | --------- | -------- | --------- | ------------ |
| Secondary text on field fill | `#64748B` | 4.34:1 ✗ | `#5B6B7F` | 4.97:1 ✓     |
| Success on white             | `#059669` | 3.77:1 ✗ | `#047857` | 5.48:1 ✓     |
| Warning on white             | `#D97706` | 3.19:1 ✗ | `#B45309` | 5.02:1 ✓     |
| Placeholder on field fill    | `#94A3B8` | 2.34:1 ✗ | `#5B6B7F` | 4.97:1 ✓     |
| Field boundary               | `#E2E8F0` | 1.23:1 ✗ | `#828C9C` | 3.40:1 ✓     |

The last one is the interesting case. A neutral-100 fill on a white card measures **1.09:1** — so
before this change, nothing on screen identified a text field as an interactive control, which WCAG
1.4.11 requires at 3:1. The minimal aesthetic wanted a fill and no border; the rule wanted a visible
boundary. **The rule wins**, and a 1px hairline is the smallest honest way to satisfy it.

It is drawn as a `ring` (box-shadow) rather than a `border`, because a border consumes 2px of the
row's content box and drops the field below the 44px target floor — measured, not assumed.

### Two token layers, and why

Colour is defined twice on purpose:

1. A **raw palette** (`--color-primary-600`, `--color-neutral-900`) — fixed values, identical in both
   themes.
2. **Semantic tokens** (`--color-surface`, `--color-fg`, `--color-outline`, `--color-accent`) that
   name a _role_ and resolve differently per theme.

Components reference the semantic layer. That is what makes dark mode a palette swap rather than a
`dark:` variant on every element — and what stops the two themes drifting apart as the UI grows.

### Dark mode

System-detected via `prefers-color-scheme`, with `color-scheme` set so form controls and scrollbars
follow. **No toggle and no stored preference**: the browser resolves the media query before first
paint, which no JavaScript toggle can, so there is no flash of the wrong theme.

| Role     | Light     | Dark      | Measured (dark, on surface) |
| -------- | --------- | --------- | --------------------------- |
| bg       | `#F8FAFC` | `#0A0E16` | —                           |
| surface  | `#FFFFFF` | `#131A26` | —                           |
| sunken   | `#F1F5F9` | `#1C2534` | —                           |
| fg       | `#0F172A` | `#F1F5F9` | 15.93:1                     |
| fg-muted | `#5B6B7F` | `#9FB0C6` | 7.89:1                      |
| outline  | `#828C9C` | `#647391` | 4.02:1                      |
| accent   | `#2563EB` | `#60A5FA` | 6.86:1                      |
| success  | `#047857` | `#34D399` | 9.08:1                      |
| warning  | `#B45309` | `#FBBF24` | 10.45:1                     |
| danger   | `#DC2626` | `#F87171` | 6.31:1                      |

Two things the dark palette does differently, both deliberate:

- **The accent lightens.** `#2563EB` measures 2.4:1 as text on a dark surface. The _button_ keeps the
  darker fill, because white on `#2563EB` is 5.17:1 either way — only accent **text** changes.
- **Elevation stops using shadow.** Shadows read as noise on dark surfaces, so the card separates
  from the page by stepping lighter, plus a hairline ring. In light mode the shadow does the work.

Every pairing above was measured before it was written, in both themes.

---

## 3. Typography

**Inter** — excellent tabular figures, which matters because we render numbers that must not shift
width while typing.

```
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Loading strategy.** Preferred: `next/font/google`, which self-hosts Inter at build time — no
runtime request to Google, no layout shift, no third party in the critical path. That step needs
build-time network access; where it is unavailable, ship the stack above unchanged. The
`--font-sans` variable is the seam that keeps the swap to one line in `layout.tsx`.

### Scale

| Token               | Size / Line height | Weight | Use                     |
| ------------------- | ------------------ | ------ | ----------------------- |
| `--text-display`    | `3.5rem / 1.05`    | 700    | **The result**          |
| `--text-display-sm` | `2.5rem / 1.1`     | 700    | The result at ≤ 375px   |
| `text-2xl`          | `1.5rem / 1.3`     | 600    | Page title              |
| `text-lg`           | `1.125rem / 1.5`   | 500    | Amount input, selection |
| `text-base`         | `1rem / 1.5`       | 400    | Body                    |
| `text-sm`           | `0.875rem / 1.45`  | 400    | Labels, secondary line  |
| `text-xs`           | `0.75rem / 1.4`    | 500    | Timestamps              |

**Rules**

- The result and the amount field use **tabular figures** (`.tabular`). Without it digits change
  width as the user types and the number visibly jitters — a small detail that reads as cheapness.
- Inputs never go below `1rem` on mobile: anything smaller triggers iOS Safari's zoom-on-focus, which
  throws the user out of the layout mid-tap.

---

## 4. Spacing — the 8-point grid

**`--spacing: 0.5rem`.** Tailwind's entire numeric scale is a multiple of this token, so setting it
to 8px makes the grid structural rather than a convention people have to remember. There is no way to
express a 5px gap without deliberately reaching for a half-step.

> **Arriving from another Tailwind project?** The numbers here are 8px units, not the stock 4px ones.
> `p-4` is **32px**. This is the system's one genuine surprise, and it is deliberate.

| Utility | Value | Typical use                    |
| ------- | ----- | ------------------------------ |
| `0.5`   | 4px   | Optical alignment **only**     |
| `1`     | 8px   | Tight grouping, icon gaps      |
| `2`     | 16px  | Field padding, screen gutter   |
| `3`     | 24px  | Card padding (mobile)          |
| `4`     | 32px  | Card padding (desktop), blocks |
| `5`     | 40px  | Section separation             |
| `8`     | 64px  | Major vertical rhythm          |

Half-steps exist for aligning an icon against a text baseline, never for layout rhythm.

**Named size tokens** (not rhythm values, so they are named rather than numbered):

| Token                | Value        | Meaning                          |
| -------------------- | ------------ | -------------------------------- |
| `--spacing-touch`    | 2.75rem/44px | Minimum comfortable target       |
| `--spacing-touch-lg` | 3.25rem/52px | Primary action in the thumb zone |

That this genuinely enforces the grid is not theoretical: writing `w-40` out of old habit produced a
320px element and a horizontal overflow at 320px width, caught by an automated check. The footgun is
real, which is also the evidence that the constraint binds.

---

## 5. Radius, Elevation, Motion

| Token          | Value | Use                 |
| -------------- | ----- | ------------------- |
| `--radius-md`  | 12px  | Fields, selectors   |
| `--radius-lg`  | 16px  | Buttons             |
| `--radius-xl`  | 24px  | Cards, bottom sheet |
| `rounded-full` | —     | Icon buttons, pills |

| Token         | Value                             | Use              |
| ------------- | --------------------------------- | ---------------- |
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / .04)`   | Resting controls |
| `--shadow-md` | `0 4px 12px rgb(15 23 42 / .06)`  | Cards            |
| `--shadow-lg` | `0 12px 32px rgb(15 23 42 / .10)` | Sheet, dropdown  |

Depth comes from space and hierarchy; shadows never stack to compete for attention.

**Motion is micro-interaction only.**

| Token             | Value                      | Use                          |
| ----------------- | -------------------------- | ---------------------------- |
| `--duration-fast` | 120ms                      | Hover, focus, color change   |
| `--duration-base` | 200ms                      | Panel open, chevron rotation |
| `--ease-out`      | `cubic-bezier(.16,1,.3,1)` | Default                      |

Motion confirms that a tap registered, then gets out of the way. Nothing is long enough to be
_noticed_ as an animation — that is the definition of a micro-interaction and the reason there are no
flourishes here.

**The result never animates its value.** Counting-up digits would delay comprehension in exchange for
a flourish, directly violating the 3-second promise. All transitions collapse to ~0ms under
`prefers-reduced-motion: reduce`.

---

## 6. Component Inventory

Six primitives in `components/ui/`. None knows anything about currencies or conversion — domain-aware
composition lives in `components/converter/` (Phase 4).

### `Button`

```tsx
<Button variant="primary|secondary|ghost" size="md|lg" isLoading isFullWidth />
```

- Both sizes clear 44px; `lg` (52px) is for the primary action.
- `isLoading` sets `aria-busy`, disables interaction, and **keeps the label in the accessibility
  tree** — a name that vanishes mid-request leaves a screen-reader user with nothing to return to.
  The label also holds its width, so the button cannot resize under a finger mid-tap.
- Defaults to `type="button"`; defaulting to `submit` is a classic accidental-submit bug.

### `IconButton`

```tsx
<IconButton label="Intercambiar monedas" variant="solid|subtle|ghost" />
```

- **`label` is required by the type system.** An icon-only control without one is unusable with a
  screen reader, and this is too easy to forget to leave to review.
- 44×44 circle. The icon is `aria-hidden`, so the name is never duplicated.

### `Input`

```tsx
<Input label="Importe" isLabelHidden leading="฿" trailing={<IconButton…/>}
       hint="…" isEmphasised />
```

- Label always present and associated; `isLabelHidden` hides it visually only. A placeholder is never
  a label — it disappears the moment the user types.
- `hint` is wired through `aria-describedby`.
- Focus ring is applied with `focus-within` on the row, so the field reads as one control even when
  the trailing slot holds a separate button.
- **`trailing` is the camera seam** (§9).

### `Select`

```tsx
<Select label="Tu moneda" value={code} options={…} onChange={…}
        searchLabel="Buscar moneda o país" noResultsLabel="…" />
```

The most complex primitive. Implements combobox-with-listbox:

- The search field owns `role="combobox"`; the list owns `role="listbox"`; the active option is
  pointed at with **`aria-activedescendant`**, so focus never leaves the input and typing is never
  interrupted.
- Keyboard: `↓` `↑` (wrapping), `Home`, `End`, `Enter`, `Esc`, `Tab`. Escape restores focus to the
  trigger rather than dumping the user at the top of the document.
- Opens with the **current selection active**, not the top of a 156-item list.
- Search matches code, name, and country, and **folds accents** — "Japon" finds "Japón", because a
  traveler typing one-handed should not have to reach for the accent key.
- Empty results show a message, never an empty panel.

### `Card`

The primary surface. `--radius-xl`, `--shadow-md`, 24px padding rising to 32px from `md`.

### `Skeleton`

Sized by the caller so it occupies the exact dimensions of the content it replaces, preventing the
layout shift a spinner would cause. `aria-hidden` — the surrounding region announces loading, so a
screen reader should not also read a row of empty boxes.

---

## 7. Layout, Mobile-First and One-Handed Reach

**Mobile is the design; desktop is the adaptation.**

| Breakpoint | Width  | Behavior                                     |
| ---------- | ------ | -------------------------------------------- |
| base       | 320px+ | Single column, full-width controls           |
| `sm`       | 640px+ | Select becomes a dropdown instead of a sheet |
| `md`       | 768px+ | Card max-width `28rem`, vertically centered  |

The card never exceeds `28rem`. A conversion stretched across a 1440px monitor looks like a form;
kept narrow, it looks like an answer.

### The thumb zone

On a phone held one-handed, the comfortable arc is the **bottom two-thirds** of the screen. The top
corners are the hardest to reach. Two consequences, both implemented:

1. **The `Select` panel opens as a bottom sheet on phones**, anchored to the bottom edge with a
   scrim — options land under the thumb instead of at the top of the screen. From `sm` up, where
   there is a pointer, it is an ordinary anchored dropdown.
2. **Primary actions sit low in the card**, at `touch-lg` (52px). Reference and status content sits
   above, where reading is easy but reaching is not.

Sheet padding respects `env(safe-area-inset-bottom)` so the home indicator never overlaps a control.

**Vertical order (mobile):** title → amount + source currency → swap → target currency → **result** →
freshness.

---

## 8. Accessibility

Part of the definition of done, and **verified in a real browser**, not asserted.

- **Contrast:** ≥ 4.5:1 text, ≥ 3:1 UI boundaries and meaningful graphics. All 17 pairs measured and
  passing (§2).
- **Touch targets:** ≥ 44×44px, automatically checked across the gallery. The check found the amount
  field rendering at 40px inside its 44px row and it was fixed.
- **Focus:** a 2px `primary-500` ring at 2px offset on every interactive element. Removing a focus
  indicator without replacing it is a review blocker.
- **Labels:** every control has a programmatic label; `IconButton` enforces it at the type level.
- **Keyboard:** everything operable without a pointer; `Select` implements the full listbox key set.
- **Live regions:** the result is announced politely on change (Phase 4).
- **Motion:** all transitions respect `prefers-reduced-motion`.
- **Zoom:** `maximumScale: 5` — capping zoom fails WCAG 2.2 and hurts exactly the users who need it.
- **No horizontal scrolling at 320px**, automatically checked.

---

## 9. Prepared for capture (OCR / camera) — no redesign required

Requirement: future OCR and camera features must integrate **without redesigning the interface**.
That is satisfied structurally, with nothing built and no speculative abstraction (ADR-012):

| What capture needs            | What already exists                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| A trigger in the input row    | `Input`'s `trailing` slot — takes any node, changes no layout                                    |
| A circular icon control       | `IconButton`, 44×44, label required                                                              |
| A full-screen capture surface | The bottom-sheet pattern already in `Select`, at `70dvh`                                         |
| A reachable position          | The thumb zone (§7) already anchors interactive surfaces to the bottom                           |
| A loading state for OCR       | `Button isLoading` and `Skeleton`                                                                |
| An error state                | `danger` tokens, and a degraded pattern that already distinguishes "working with imperfect data" |

The gallery renders a camera `IconButton` in `Input`'s trailing slot **today**, and a test asserts
that slot stays focusable and separately reachable. If the seam ever breaks, a test fails rather than
a future feature discovering it.

What is deliberately **not** built: no camera permission flow, no OCR pipeline, no capture route.
`FEATURES.ocr` is `false`.

---

## 10. Implementation

Tailwind 4 is CSS-first: **there is no `tailwind.config.js`.** Tokens live in `@theme` in
`app/globals.css`, which generates the utilities automatically.

Hardcoded hex values, arbitrary `text-[13px]`, or one-off shadows anywhere in `components/` are review
blockers — if a value is missing, it is added to `@theme` and documented here first.

Class merging goes through `cn()` (`lib/utils/cn.ts`), which uses `tailwind-merge` so a caller's
`className` reliably overrides a variant default (ADR-011).

### The gallery

`/design-system` renders every primitive in every state on one page. It exists so a visual regression
is visible in one place rather than discovered in the product, and so a reviewer can see the system
without reading JSX. It is `noindex` and unlinked — a team tool, not a page.
