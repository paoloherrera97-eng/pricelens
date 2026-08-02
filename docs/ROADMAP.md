# PriceLens — Roadmap

**Status:** Living document

This roadmap has no dates. Dates on a pre-launch roadmap are fiction, and fiction in a planning
document is how teams end up shipping the wrong thing on time.

What it does have is **ordering and rationale** — which comes next, and what has to be true before it
does.

---

## Principle

> **We earn the right to add complexity by first proving the simple thing works.**

Every version below is gated on the previous one succeeding, measured against the 3-second promise.
A feature that would be great in V4 is a liability in V1, because it dilutes the thing we haven't
proven yet.

Each entry is tested against the product question from `PROJECT_BIBLE.md`: *does this help travelers
understand prices faster?* Features that fail the question in V1 sometimes pass it later, once the
foundation makes them cheap. That change of answer is what a roadmap is for.

---

## V1 — The 3-Second Conversion

**Theme:** One screen, done exceptionally well.

Manual amount input · foreign currency selector · home currency selector · live exchange rates ·
beautiful conversion result · swap direction · rate freshness indicator · responsive mobile-first UI ·
fast loading · full accessibility.

**Done when:** a traveler can open the app cold, on hotel Wi-Fi, and understand a foreign price in
under 3 seconds — and trust the number.

**Deliberately excluded:** everything in the versions below. See `PRODUCT_REQUIREMENTS.md` §4.2.

---

## V2 — Comfort

**Theme:** Make the second and hundredth use faster than the first.

Gated on V1 proving the core loop works.

| Feature | Why it earns a place | Why not in V1 |
| --- | --- | --- |
| **Recent / favorite currencies** | A traveler uses two currencies for two weeks. Surfacing them removes the largest remaining tap cost. | Requires knowing which pairs users actually reach for — that data doesn't exist until V1 ships. |
| **Dark mode** | Travelers check prices at night and in dim restaurants; a white screen at full brightness is genuinely unpleasant. | Purely comfort, not comprehension. Every V1 color is already a CSS custom property, so this is a palette addition rather than a refactor. |
| **Offline rate packs** | Explicitly caching rates for a chosen destination turns "works if loaded" into "works, period." | V1 already degrades gracefully offline via the fixture provider (`ARCHITECTURE.md` §7). This makes it deliberate rather than incidental. |
| **Home-screen install (PWA)** | An app-like launch removes browser chrome and speeds cold start. | Adds a service worker and a cache-invalidation surface. Not worth it before the core is stable. |
| **Shareable conversion links** | `/?from=THB&to=EUR&amount=1890` lets a traveler send a price to whoever they're travelling with. | Small, but it needs the URL-state design settled first. |

---

## V3 — Capture

**Theme:** Stop making the user type.

Gated on V2, because capture only pays off once the conversion itself is instant — otherwise it
speeds up the fast part and leaves the slow part intact.

| Feature | Why | Cost to be honest about |
| --- | --- | --- |
| **Camera + OCR of price tags** | Point at a tag, get the answer. This is the single largest possible cut to time-to-understanding — it removes reading, transcribing, and typing in one step. | Camera permissions, OCR accuracy across fonts and lighting, currency-symbol detection, and a much larger error surface. Getting this wrong is worse than not having it. |
| **Automatic currency detection from symbol** | `฿` implies THB. Detecting it removes a selector interaction entirely. | Symbol collisions are real: `$` maps to a dozen currencies, `kr` to four. Needs a disambiguation flow that doesn't reintroduce the tap we just saved. |
| **Multi-price capture** | A restaurant menu is 30 prices. Converting all of them at once is qualitatively different from converting one. | Only feasible once single-price OCR is reliable. |

---

## V4 — Context

**Theme:** Turn a number into a judgment.

This is where PriceLens stops being a conversion tool and becomes the travel shopping assistant the
mission describes.

| Feature | Why | Prerequisite |
| --- | --- | --- |
| **"Is this expensive here?"** | Knowing `฿1,890 = €48` still doesn't answer the traveler's real question: *should I buy this?* Local price context is the difference between data and a decision. | Requires reliable local price-level data. Getting this wrong gives confidently bad advice, which is worse than silence. |
| **Familiar-purchase anchoring** | "About 3 coffees at home" is understood faster than any number, because it skips arithmetic entirely. | Needs a defensible reference basket per currency. |
| **Tipping and tax norms** | Both are country-specific, both surprise travelers, and both change what you actually pay. | Curated data per country. |
| **AI price assistant** | Free-form questions about a price in context. | Only credible once the underlying context data in this version is trustworthy. AI on top of unreliable data multiplies the unreliability. |

---

## V5 — Continuity

**Theme:** Sync, once there is something worth syncing.

| Feature | Why | Why last |
| --- | --- | --- |
| **Accounts and sync** | Preferences and saved trips across devices. | Accounts are a permanent tax on every future feature: auth flows, sessions, password resets, deletion, privacy compliance. We pay it only when users have something they'd genuinely lose. |
| **Trip history** | Reviewing what you spent, and where. | Meaningless without accounts and enough captured data to be interesting. |
| **Budget tracking** | Per-trip spend against a plan. | The natural extension of history — and a different product, entered deliberately rather than by drift. |

---

## Permanently Out of Scope

Not "later" — **not ever**, unless the mission itself changes:

- **Ads.** They would directly attack the 3-second promise, on the one screen the whole product
  depends on.
- **Selling user data.** Incompatible with a tool people open while making purchases.
- **Trading, charts, and rate alerts.** A different user with a different job. Serving them would
  compromise the traveler — this is exactly the "currency converter" trap the Project Bible defines
  the product against.
- **Crypto.** Not a travel currency. Adding it would signal we're building for speculators.

---

## How This Roadmap Changes

Adding an item requires answering the product question, naming the prerequisite that unblocks it,
and being honest about its cost. Items move between versions when evidence changes — not when they
become technically easy. **Easy is not a reason to build something.**
