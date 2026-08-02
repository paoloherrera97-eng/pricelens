# PriceLens — Product Requirements (V1 MVP)

**Status:** Approved for build · **Version:** 1.0 · **Owner:** Product

This document defines *what* V1 must do and how we will know it is done. It does not define *how* —
that is `ARCHITECTURE.md`.

---

## 1. Problem

A traveler standing in a shop in Bangkok sees `฿1,890`. They have no idea whether that is cheap,
reasonable, or a tourist price. Their options today are all bad:

- **Mental arithmetic** — slow, error-prone, and impossible with unfamiliar exponents (is ₫250,000 a
  coffee or a hotel night?).
- **A search engine** — requires typing a full query, tolerating ads, and a working connection.
- **A generic converter app** — buried under charts, rate alerts, portfolios, and interstitial ads;
  optimized for people who care about currencies rather than people who care about *prices*.

All three break the moment the connection is weak, which on travel is most of the time.

**The gap:** there is no tool designed for the specific moment of *holding a price you don't
understand.*

---

## 2. Target User

**Primary: the active traveler.**

- On a phone, one-handed, often outdoors in bright light.
- On unreliable Wi-Fi or expensive roaming data.
- In a hurry, sometimes mildly stressed, occasionally being watched by a shopkeeper.
- Not a finance person. Does not know or care what the mid-market rate is.
- Needs an answer, not information.

**Explicit non-users for V1:** traders, accountants, expense-reporting business travelers, and
anyone who wants historical data. Serving them would compromise the primary user.

---

## 3. Primary User Story

> **As a traveler**, I want to type a foreign price and immediately see what it costs in my own
> currency, **so that** I can decide whether to buy it without doing math or losing my place in the
> conversation.

### Supporting stories

- As a traveler, I want the app to already know my home currency, so I don't re-select it every time.
- As a traveler, I want to switch the direction of the conversion in one tap, because sometimes I
  need to think in the local currency instead.
- As a traveler, I want to know whether the rate I'm seeing is current, so I know how much to trust
  it.
- As a traveler on bad Wi-Fi, I want a usable answer rather than an error screen.

---

## 4. Scope

### 4.1 In scope for V1

| # | Requirement | Notes |
| --- | --- | --- |
| S1 | Manual amount input | Numeric, decimal-aware, mobile numeric keypad |
| S2 | Foreign (source) currency selector | Searchable, 160+ currencies |
| S3 | Home (target) currency selector | Same component, persisted |
| S4 | Live exchange rates | Refreshed hourly server-side |
| S5 | Conversion result | The visual centerpiece |
| S6 | Swap direction | One tap, no reload |
| S7 | Rate freshness indicator | Timestamp + degraded-state messaging |
| S8 | Responsive, mobile-first UI | 320px → desktop |
| S9 | Fast first load | See §6 |
| S10 | Full keyboard + screen-reader support | WCAG 2.2 AA |

### 4.2 Explicitly out of scope for V1

Authentication · database · user accounts · payments · notifications · ads · OCR · camera · history ·
dark mode · AI.

These are **decisions, not omissions** (see `PROJECT_BIBLE.md` → Scope Discipline). Each is scheduled
in `ROADMAP.md`.

### 4.3 The one documented exception

**Home currency is persisted to `localStorage`** — a single string such as `"EUR"`.

| It is | It is not |
| --- | --- |
| One preference key | A database |
| Device-local | An account |
| Overwritten on change | A history or a log |
| Zero PII | Anything requiring consent or a cookie banner |

Rationale: a returning traveler re-selecting their home currency on every visit pays a direct tax
against the 3-second promise. The foreign currency is deliberately **not** persisted — it changes
per country, and a stale value would be actively misleading. Recorded as ADR-005.

---

## 5. Functional Requirements

### FR-1 — Amount input
- Accepts digits and a single decimal separator.
- Accepts both `.` and `,` as decimal separators (a European traveler types `12,50`).
- Rejects letters and multiple separators without an error message — invalid characters simply never
  appear. Punishing a user with an error for a keystroke we could ignore is a design failure.
- Empty input is a valid state showing a neutral zero result, not an error.
- Triggers `inputmode="decimal"` so phones show a numeric keypad.
- No maximum, but values beyond safe display precision are formatted in compact notation.

### FR-2 — Currency selection
- Both selectors draw from the same currency dataset and the same component.
- Searchable by **code** (`JPY`), **name** (`Japanese Yen`), and **country/common name** (`Japan`) —
  travelers know the country, not always the currency code.
- Each option shows the code, the name, and the symbol.
- Selecting the currency already chosen in the other field triggers an automatic swap rather than an
  invalid same-currency state.

### FR-3 — Conversion
- Recomputes on every change to amount, source, or target — with no network request (ADR-001).
- Perceived latency target: **< 16ms** (one frame). This is arithmetic; it should never be visible.
- Rounds to the target currency's real minor-unit digits (ADR-006).
- Displays the effective rate used (`1 THB = 0.026 EUR`) as a secondary line, because trust requires
  showing the working.

### FR-4 — Swap
- One control, one tap, no layout shift, no refetch.
- Swaps the currencies and preserves the amount.

### FR-5 — Rate freshness and degradation

| State | Behavior |
| --- | --- |
| **Fresh** | Show the result and a quiet `Updated <relative time>` line |
| **Loading** | Show the layout with a skeleton in the result slot — never a blank screen or a spinner-only page |
| **Stale** (cached, older than expected) | Show the result with a visible but non-alarming staleness note |
| **Provider failure** | Fall back to bundled snapshot rates, clearly labeled as approximate and dated |
| **Offline** | Same as provider failure, plus an offline indicator |

The app must never (a) show a number without indicating how current it is, or (b) present fallback
data as if it were live. Requirement FR-5 exists to protect Value #4 in the Project Bible.

### FR-6 — Persistence
- Home currency written to `localStorage` on change, read on mount.
- A missing, corrupt, or unparseable value falls back to the default without throwing.
- Absence of `localStorage` (private mode, disabled storage) degrades silently to session-only.

---

## 6. Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| **Performance** | LCP < 1.5s on a simulated Fast 3G / mid-tier mobile device. TTI < 2.0s. Conversion recompute < 16ms. |
| **Bundle** | Initial client JS ≤ 100KB gzipped. Every dependency must justify its weight. |
| **Accessibility** | WCAG 2.2 AA. Fully keyboard operable. All controls labeled. Result announced via a polite live region. Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries. |
| **Touch** | Minimum 44×44px interactive targets. |
| **Responsive** | Fully functional from 320px width upward. Mobile-first; desktop is the adaptation, not the baseline. |
| **Browser support** | Last 2 versions of Safari (iOS + macOS), Chrome, Firefox, Edge. iOS Safari is the primary target — it is what travelers carry. |
| **Reliability** | The app renders and remains usable with the rate provider entirely unreachable. |
| **Privacy** | No tracking, no cookies, no PII, no third-party client-side scripts in V1. |
| **i18n readiness** | Number and currency formatting is locale-aware from day one. UI copy is English in V1 but is not hardcoded in a way that blocks translation. |

---

## 7. Edge Cases

Each must have a designed, implemented, and tested behavior.

| # | Case | Required behavior |
| --- | --- | --- |
| E1 | Empty amount | Neutral zero result. Not an error. |
| E2 | Amount is `0` | Show zero in the target currency. Valid. |
| E3 | Decimal separator ambiguity (`12,50`) | Parsed as 12.5 |
| E4 | Zero-decimal currency (JPY, KRW, VND) | Rounded to 0 decimals |
| E5 | Three-decimal currency (KWD, BHD, OMR) | Rounded to 3 decimals |
| E6 | Very large amount (₫250,000,000) | Formatted readably; no overflow, no layout break |
| E7 | Very small result (< 0.01) | Show meaningful precision rather than `0.00` — `$0.0031` is useful, `$0.00` is a lie |
| E8 | Same currency selected in both fields | Auto-swap; never a 1:1 dead end |
| E9 | Rate provider returns malformed data | Reject the payload at the boundary, fall back, log server-side |
| E10 | Rate provider unreachable / times out | Fallback rates + labeled degraded state |
| E11 | User goes offline mid-session | Conversion continues working from the in-memory table |
| E12 | Currency present in the app but missing from the provider payload | Excluded from selectors rather than producing a broken conversion |
| E13 | `localStorage` unavailable or throws | Session-only operation, no crash |
| E14 | Extremely long currency name in the selector | Truncates with ellipsis; layout holds |

---

## 8. Success Criteria

V1 is done when all are true:

1. A cold-start user completes their first conversion in **under 3 seconds**, measured from
   navigation start to a correct visible result.
2. Every requirement in §5 is implemented and every edge case in §7 has a passing test.
3. Lighthouse mobile: **Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95**.
4. The app is fully functional with the rate provider blocked at the network level.
5. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass clean.
6. Conversion math has unit-test coverage including every edge case in E3–E7.

---

## 9. Explicit Non-Goals

State so that they are never accidentally optimized for:

- We do not aim for trader-grade rate accuracy. Mid-market rates refreshed hourly are correct for
  deciding whether to buy a scarf; they are not correct for executing a trade, and we do not pretend
  otherwise.
- We do not aim to show what the user's bank will actually charge — that requires card, bank, and
  fee data we deliberately do not collect in V1.
- We do not aim for feature parity with any existing converter. Parity is the failure mode.
