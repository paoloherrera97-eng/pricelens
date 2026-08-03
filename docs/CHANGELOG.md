# Changelog

All notable changes to PriceLens are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added — tipo de cambio seleccionable en Argentina (ADR-018)

El peso se cotiza de varias formas según cómo pagues, y hasta ahora la app usaba la oficial sin
decirlo. Para un viajero pagando en efectivo eso no es una aproximación: es un número equivocado
dado con confianza, que es justo el fallo que este producto no puede permitirse.

**Arquitectura de superposición.** El proveedor base y su tabla única no cambian. Se añade una capa
de _overlays_ que aporta cotizaciones alternativas para monedas concretas; el snapshot las lleva
junto a `rates` y el cliente sustituye la elegida en su propia copia de la tabla antes de convertir.

**El motor de conversión no se toca, y esa es la propiedad que sostiene el diseño.** `applyVariant`
cambia una clave de la tabla y devuelve una tabla; `getRate` y `convert` reciben lo de siempre y
siguen puros, síncronos y sin enterarse de que existen variantes. Una variante no es un tipo nuevo
de tasa: es otro número en el mismo hueco.

- **Selector visible** —Blue, Tarjeta, Oficial— solo donde hay más de una cotización. El resto de
  destinos se ve exactamente igual que antes: sin selector y con la línea de tasa intacta.
- **Por defecto Blue**, y el razonamiento se deja escrito porque es discutible: «más segura» puede
  significar minimizar la _dirección_ del error —la oficial nunca abarata— o su _tamaño_, donde la
  oficial es la peor de las tres. Gana la segunda lectura **porque el selector es visible**.
- **La elección se recuerda** entre visitas, por moneda.
- **La línea de tasa nombra la cotización** (`1 ARS = 0,000736 EUR · Blue`). Un número sin atribuir
  es el fallo que ADR-013 existe para evitar, y no cuesta una línea de alto.
- **Un overlay caído no puede romper la app**: se espera con `allSettled` y un rechazo se descarta.
  Sin variantes, el comportamiento es idéntico al anterior.
- **La fuente no es un banco central**, así que se trata como entrada hostil: casas desconocidas
  ignoradas, valores no numéricos descartados y el overlay **entero** rechazado si alguna cotización
  se aleja más de 10× de la oficial.

**Sin verificar contra producción:** este entorno bloquea el tráfico saliente, así que el contrato
del endpoint —que responda y tenga la forma que el parser espera— **no está confirmado**. El parser
está escrito para que un fallo degrade a la tasa oficial sin selector, nunca a un precio erróneo, y
todas sus ramas están cubiertas con fixtures. Necesita una comprobación en producción.

### Fixed — detalles de acabado (auditoría 🟢)

- **El estado vacío ya no anuncia una conversión que no ha ocurrido.** El «0,00 €» visible es un
  marcador que mantiene abierto el alto de la tarjeta, pero la región viva también lo leía: un lector
  de pantalla oía «0,00 ฿ equivale a 0,00 €» sin que nadie hubiera pedido nada. El hueco se sigue
  reservando; solo calla hasta que hay importe.
- **`text-xs` recupera el interlineado documentado.** El sistema especifica 1,4 y Tailwind trae 1,33,
  así que los avisos de dos líneas iban 0,8px apretados por línea. Medido: 12px / 16,8px.

### Revisado y descartado

Dos puntos que la auditoría marcó y que, al analizarlos, **no** son defectos:

- **Los 110 espaciados de 4px.** Parecían cuartos de paso en un sistema de 8 puntos, pero 4px es el
  medio paso que tanto el propio sistema (`--spacing: 0.5rem`, donde `0.5` = 4px) como Material
  Design 3 admiten para relaciones estrechas —etiqueta con su campo—. Cambiarlos habría sido
  uniformidad por uniformidad.
- **El chip de favorito activo sin `hover`.** Los inactivos sí lo tienen. Darle uno al que ya está
  seleccionado sugeriría que pulsarlo hace algo, y no hace nada: su ausencia es la señal correcta.

### Fixed — consistencia del sistema (auditoría 🟠)

Cuatro incoherencias entre lo que el sistema de diseño documenta y lo que la app renderiza. Todas
medidas en la build de producción.

- **Los tokens de movimiento estaban muertos.** Tailwind construye las utilidades `duration-*` a
  partir de `--transition-duration-*`, no de `--duration-*`. Con el nombre antiguo las variables
  existían, las clases no se generaban y **las ocho componentes que las usan caían al valor por
  defecto de Tailwind, 150ms**. El sistema documenta 120/200ms y nadie los estaba viendo. Verificado
  en el navegador: las duraciones en uso pasan de `0.15s` a `0.12s` y `0.2s`.
  (`ease-out` sí funcionaba: ese namespace es el correcto y resuelve al token del proyecto.)
- **Tres grosores ópticos de icono distintos** — 1,33px (chevron, borrar), 1,5px (estrella,
  compartir), 1,67px (intercambiar) — porque el grosor del trazo se escribía sin compensar el tamaño
  de render. Ahora los seis miden **1,5px**: 2,25 a 16px y 1,8 a 20px, ambos sobre un `viewBox` de 24.
- **La estrella de favoritos usaba ámbar**, color que el propio sistema reserva para «tasas
  obsoletas». El principio escrito es «el color significa algo o no está», y el ámbar significaba dos
  cosas. Ahora usa el acento, que es el color de acción.
- **El botón de intercambio llevaba `shadow-md`**, la misma elevación que la tarjeta que lo contiene.
  Un control de 44px elevado tanto como la superficie que lo sostiene aplana la jerarquía en vez de
  expresarla. Baja a `shadow-sm`.

axe sigue sin violaciones en ambos temas.

### Changed — el resultado vuelve a estar sobre el pliegue (auditoría 🔴)

Medido en la build de producción antes de tocar nada: **con un solo favorito guardado, el resultado
caía fuera de la pantalla en Safari iOS siempre que la barra de direcciones estaba expandida**, que
es su estado al abrir la app.

| Viewport                             | Antes    | Ahora    |
| ------------------------------------ | -------- | -------- |
| iPhone SE2 barra expandida (375×553) | −107px ✗ | +51px ✓  |
| iPhone 12 mini (390×629)             | −31px ✗  | +127px ✓ |
| iPhone 13 barra expandida (390×600)  | −60px ✗  | +98px ✓  |
| iPhone 13 colapsada (390×664)        | +4px     | +162px ✓ |

Tres cambios, ninguno de ellos recorte arbitrario de píxeles:

- **Los favoritos pasan debajo del resultado.** Un favorito no es una entrada de _esta_ conversión:
  es el atajo para empezar la siguiente. Encima, separaba el selector de moneda de su propia
  respuesta —la adyacencia más importante de la pantalla— y empujaba el resultado 84px hacia abajo.
  Ahora la posición del resultado **no depende del número de favoritos**: 372–502px con 0, 1, 2 u 8.
- **El tagline se oculta en teléfonos** (`sm:` en adelante lo mantiene). Cuesta 51px de los ~553 que
  deja Safari con la barra expandida, y ahí el resultado vale más que una frase explicativa. Sigue
  siendo la meta description, así que el SEO no depende de que se pinte.
- **El relleno vertical de la página baja de 16px a 8px en móvil.** Era redundante: la tarjeta ya
  aporta sus propios 24px, así que sumaban 40px entre el borde de la pantalla y la primera etiqueta.

**Lo que sigue sin caber:** el iPhone SE de 1.ª generación (320×460 con la barra expandida) queda
40px corto. Es un dispositivo de 2016 y no hay forma de resolverlo sin quitar contenido que sí
importa; ahí el usuario desplaza.

Verificado además: sin desbordamiento horizontal en ningún viewport de 320 a 1440, y axe sin
violaciones en claro y oscuro.

### Added — share (Phase 2, feature 5 of 8)

A conversion is now a link. The address bar carries `country`, `to` and `amount`; a share control
hands that link to the platform's own share sheet, the clipboard, or a QR code, whichever the device
actually supports.

**URL state**

- Synchronised with `history.replaceState` — a native, synchronous write React never sees, debounced
  so a fast typist produces one update rather than ten. **Replace, not push**: pushing would make the
  back button walk backwards through every amount the user typed.
- **The amount travels as typed.** Normalising it would mean choosing a format, and the recipient
  would see a number the sender never wrote. It runs through the same sanitiser the input uses in
  both directions, so a link can never introduce text the field would have refused — and a
  hand-written `?amount=1890.5` still works.
- A link is untrusted input: each parameter is validated independently, and a broken one is dropped
  rather than failing the whole link. A URL truncated by a chat client still restores what survived.
- **A link outranks detection.** Opening a shared price states which conversion to show, so the
  home-currency guess from ADR-015 is skipped when the link names a currency.

**Sharing**, chosen by capability rather than by user agent or screen width:

- **Web Share** where the browser has it — the native sheet is where the user's own apps live.
- **Clipboard** everywhere else, with a visible confirmation.
- **A QR code** on devices with no touch input at all — the honest test for "this is a desktop and
  the phone is the thing you want the link on". A phone in landscape is not a desktop.
- Dismissing the share sheet is a decision, not a failure: it does **not** fall through to a
  clipboard write, which would hand the user a link they just declined to send.

**The QR encoder is written, not installed** (ADR-017) — byte mode, level M, versions 1–10, ~450
lines, no runtime dependency. That is only defensible because it is verifiable: a QR that encodes to
garbage looks exactly like one that works. The tests **decode the output with an independent
decoder** (`jsqr`, a devDependency that never ships) at every payload length across the supported
range, including exhaustively from 1 to 62 bytes; the browser check scans the **rendered SVG** back
out of the DOM and compares it to the URL. Writing it also caught a real bug — the two copies of the
format information were transposed, which no structural assertion would have noticed.

It renders black on white in both themes. Inverting for dark mode would look tidier and scan worse;
the white plate doubles as the quiet zone the specification requires.

**Tests now reset the address bar between cases.** The app writes to it, and jsdom shares one
`window` per file — so one test's URL was becoming the next test's shared link and silently changing
its starting state. Three detection tests failed in the suite while passing alone, which is how it
surfaced.

**Verified** end to end against the production build: URL state written without adding history
entries, a shared link restoring all three fields, Web Share receiving the URL on a touch device with
no QR control offered, and on desktop the clipboard fallback plus a QR that **scans back to the
correct URL**. axe: 0 violations on mobile in both themes and on desktop with the QR open.

### Added — favourite pairs (Phase 2, feature 4 of 8)

A star beside the home-currency selector saves the pair on screen; saved pairs appear as a row of
chips, one tap from being restored.

**One control does both directions.** "Save this" and "unsave this" are the same thought, so the
star toggles: filled when the pair on screen is already saved, outlined when it is not. Tapping a
chip makes that pair current — which fills the star — so removing any favourite is "tap it, unstar
it", using the control that already means exactly that. There is deliberately no delete target
inside the chips: a second button in each would be either too small to hit or too large to fit on
the screen size that matters most.

- **Identity is the currency pair; the country is what gets stored.** Selecting a favourite has to
  restore what the traveler saw, and this app asks for a country rather than a currency (ADR-014) —
  "EUR → ARS" cannot say whether that was Spain or France. But Spain → ARS and France → ARS convert
  identically, so **saving one after the other is a no-op** rather than two chips reaching one
  answer.
- **Capped at 8**, newest first. A shortcut you have to search through is not a shortcut, and the
  cap means the stored value can never be the reason a write fails.
- **Stored data is treated as untrusted.** It outlives deploys, so parsing drops entries naming a
  country or currency this build no longer carries — and collapses duplicates an older version might
  have written — instead of rejecting the whole list. A corrupt value renders as no favourites, not
  as a broken screen.
- **Nothing appears until something is saved.** An empty-state prompt would be teaching a feature at
  the moment the user is trying to read a price.
- The chip row scrolls horizontally rather than wrapping, so its height never changes and the result
  below it never moves.

**The conversion path is untouched.** Favourites set the same two pieces of state the pickers set
and own none of their own; nothing in `lib/currency` or the rates layer is aware they exist. There
is a test asserting the displayed result is byte-identical across saving a favourite.

Recorded as **ADR-016**, because ADR-005 required one for any extension of stored data. The
distinction it draws: favourites are a _preference_ — declarative, curated, written only by an
explicit tap, with no amounts and no timestamps — while history is a _log_. Storage still holds only
preferences the user chose, so history remains a separate decision.

**Verified** in Chromium at iPhone 13, Pixel 7 and desktop, with real CDP touch taps on the two
mobile profiles: save, duplicate-prevention, restore-both-selectors, remove, persistence across
reload, no horizontal page overflow, and every control at least 44px tall. axe reports 0 violations
in both themes with favourites present. 28 new tests.

### Added — home-currency detection (Phase 2, feature 6 of 8)

A first-time visitor's home currency is now guessed from their device instead of defaulting to
euros for everyone. **No permission is requested, and the Geolocation API is not used** — see
ADR-015 for why that is a correctness argument and not only a politeness one: geolocation says where
the phone _is_, which for a traveler is the country whose prices they are trying to escape, not the
currency they think in.

Two signals, in order:

1. **The locale's region subtag** (`es-AR` → `AR` → `ARS`). It comes from the OS region setting and
   does not move when its owner does, which is exactly the property a _home_ currency needs. Someone
   from Argentina opening the app in Bangkok still gets pesos.
2. **The timezone**, used only when the locale carries no region (`es`, `en`). It does follow the
   phone across borders, so it is the weaker signal — but it beats defaulting to euros for someone
   in Buenos Aires.

`Intl.Locale.maximize()` is deliberately not used: turning a bare `en` into `en-Latn-US` is CLDR's
most-likely-subtags guess, not information about this user.

- **Runs once, on a visit with nothing stored.** A stored currency — chosen or previously detected —
  is never overridden. Re-detecting every visit would fight the user's own choice.
- **Cannot make anything worse.** Detection returning nothing, throwing, or naming a currency with
  no rate all leave the configured default exactly where it was, and write nothing to storage.
- **No new data is stored.** The same single key from ADR-005, holding the same kind of value.
- **Handles the collision.** A US visitor detecting USD would otherwise sit on USD → USD, a 1:1 dead
  end (PRD E8); the detected value routes through the picker's own handler, which moves the
  destination instead.
- Behind `FEATURES.detectHomeCurrency`.

**The timezone table is generated from tzdata** (`zone1970.tab` and `zone.tab`) rather than
hand-written, so no entry is invented, and it is loaded through a dynamic import — verified absent
from the initial HTML and fetched only in the region-less case. Engines disagree on which timezone
spelling is canonical (Node's ICU resolves `Asia/Kolkata` _to_ `Asia/Calcutta`, the reverse of what
browsers do), so the generator harvests both spellings from ICU and the lookup tries the reported
name before canonicalising.

**Tests now pin the device signals.** `navigator.language` in jsdom reports the runner's own locale,
so before this the app's default home currency would have depended on which machine ran the suite.
The baseline is a region-less locale and `TZ=UTC`; tests that care about detection set a locale
themselves.

### Added — iOS launch screens (Phase 2, feature 2 of 8)

The last piece of the PWA item. Installability, offline support, the manifest and the icon set all
shipped in V1 (ADR-007); what remained was that an installed app opened on a blank white screen on
iOS — and on a dark-themed phone, a white flash before a dark app.

Android and desktop Chrome build a launch screen themselves from the manifest (`background_color`
plus the icon). iOS does not. The only way to control it is to ship one image per device
resolution, matched by a media query stating the device's exact CSS width, height and pixel ratio; a
near miss matches nothing and you are back to white.

- **36 generated launch screens** — 18 portrait device sizes (every iPhone still in circulation,
  plus current iPads) × light and dark. 624KB in the repository, but a device downloads exactly one
  of them, and only when the app is installed to the home screen. They are deliberately outside the
  service worker's caching rules for the same reason: nothing the page renders ever requests them.
- **They render what Android generates** — the app background with the icon tile centred — so the
  two platforms look the same on launch. That was worth more than a distinct treatment on one.
- **Dark handling without a cliff.** The light image carries no colour-scheme condition, so it
  always matches and acts as the fallback; the dark one is declared afterwards and only matches in
  dark mode, so it wins there. On an engine that ignores `prefers-color-scheme` in this position,
  the light image still applies rather than nothing at all.
- **`scripts/generate-splash.mjs`** writes both the images and `config/splash.ts`, so the device
  matrix has one source of truth — the same generated-config pattern as countries and currencies.
  Pure Node, no image dependency; the PNG encoder and the mark itself moved to `scripts/lib/` and
  are now shared with the icon generator, whose output is unchanged **byte for byte**.

**Also fixed while here: the home-screen icon was never declared.** `apple-touch-icon.png` existed
in `public/icons/` but no `<link>` pointed at it, and iOS only looks for that filename at the site
root — so an installed app took a screenshot of the page as its icon. The metadata now declares the
icon set explicitly.

Six tests cover what nothing else can: these files are fetched by iOS and by nothing we render, so a
broken entry produces no error, no warning and no failing request — just a white screen on a phone.
They assert every declared file exists, that each filename matches the device pixels its own media
query claims, that light is always declared before dark, and that every entry is portrait-only to
match the manifest.

### Fixed — the picker list actually scrolls on touch (second attempt)

The first attempt moved selection from `pointerdown` to `click`. That was necessary and it was not
sufficient: it was still reported as broken from a real iPhone.

**The root cause was layout, not events.** The list is a flex item inside the sheet, and a flex
item's default `min-height` is `auto` — it refuses to shrink below its content, which here is 195
rows. `overflow-y: auto` then has nothing to scroll, because the box is already as tall as
everything inside it, and the sheet's `max-height` gets resolved by overflowing rather than by
scrolling. **Blink hides this; WebKit does not.** With no scroll to perform, iOS classified the
drag as a tap, fired a `click`, and the row under the finger was selected — precisely the symptom.
The fix is `min-h-0 flex-1` on the list, plus `overflow-hidden` on the sheet so nothing can spill
past its rounded edge.

That also explains why the first attempt looked verified: the list already scrolled in Chromium, so
the test that "passed" was never testing the thing that was broken.

**The component now decides tap-versus-drag itself** rather than trusting the engine, because that
judgement is exactly what differs between engines. A press records its position and the list's
scroll offset; the click that follows only commits if the pointer travelled ≤10px **and** the list
did not scroll underneath it, and never if the browser cancelled the gesture. A click with no
recorded press — keyboard activation, assistive technology — still selects, since only a real press
can be a drag. The upshot is that correctness no longer depends on which browser is running, which
is what makes it verifiable here at all.

**The keyboard no longer sits on top of the sheet.** `interactiveWidget: 'resizes-content'` in the
viewport metadata: the sheet is anchored to the bottom and focuses its search field on open, and by
default the on-screen keyboard overlays the layout viewport, so `dvh` keeps reporting the full
screen height and `70dvh` sizes the sheet partly underneath the keyboard. `resizes-content` shrinks
the layout viewport instead, so the sheet is sized against what the user can actually see.

Verified: real CDP touch drags and flicks on both selectors, at iPhone 13, Pixel 7 (Android Chrome)
and 320px — list scrolls, momentum carries, nothing is selected by dragging, a deliberate tap still
selects. The tap guard is additionally exercised end to end against the built app with a
press-then-click-90px-away sequence — the event shape an engine produces when it mistakes a drag for
a tap. 24 unit tests on `Select`, 5 of them new and covering slop, scroll, cancellation and the
keyboard path. axe: 0 violations.

**Still not verified on WebKit.** This environment cannot install it (the download is blocked at the
proxy), so the `min-h-0` half of this fix is reasoned from the CSS flexbox specification and the
known engine difference, not observed. The tap-guard half is engine-independent by construction and
is observed.

### Fixed — the result no longer overflows its card

Reported from a real iPhone: `43.863,13 ARS` almost touched both edges of the result card, and
anything larger — millions, or JPY/VND/IDR totals — ran past them.

Confirmed by measurement before changing anything. At a fixed `3rem`, `48.154.088,37 ARS` renders
**490px wide inside a 208px card** on a 320px viewport, a 2.4× overflow; three of five stress cases
overflowed on both an iPhone SE and an iPhone 13.

The result is now sized from the two things that actually decide whether it fits — the width of its
container and the length of the string:

```
font-size: clamp(1rem, calc(100cqw / (var(--len) * 0.64)), var(--fit-max));
```

A viewport-relative `clamp()` on its own cannot solve this, because the viewport says nothing about
how long the number is. `100cqw` comes from a container query on the live region, `--len` is set by
the component from `converted.length`, and `--fit-max` stays the existing display token, so short
results still render at the full 3rem (4rem from `sm`).

- `0.64` is the per-character advance ceiling, **measured, not guessed**: the worst realistic result
  string measures 0.54em/char in Liberation Sans, 0.54 in FreeSans and 0.66 in DejaVu Sans — wider
  than SF Pro, Roboto or Inter, which are what this renders in. Tabular figures are what make length
  a valid proxy for width at all.
- The margin against a wider face is physical, not numeric: the live region carries its own 8px
  inset, so a string that beats the estimate spends padding instead of overflowing, and nothing on
  the path sets `overflow: hidden`, so the worst case is a wider number and never a clipped one.
- The value is centred inside its reserved height, which is no longer always filled now that the
  size varies.

Verified against the production build in Chromium at five viewports (320 → 1440) × nine cases,
including the reported value and all three requested stress cases: every result is one line, inside
its card, with **at least 18px of clearance on both sides**.

`text-fit`/`text-fit-lg` are registered in `lib/utils/cn.ts` for the same reason `text-display` is —
tailwind-merge classifies unrecognised `text-*` utilities as colours and silently drops them.

### Known issue, not fixed here

Compact notation renders `269,3 mil MARS` for 269.3 billion pesos: Spanish uses `mil M` for 10⁹ and
`Intl.NumberFormat` sets the currency code straight after it. The layout is now correct in that case;
the _string_ is not. It is a formatting change rather than a typography one, so it ships separately.

### Fixed — iOS Safari

- **The country picker could not be scrolled by touch.** Options committed on `pointerdown` and
  called `preventDefault()` to hold focus in the search field. Both were wrong for touch: the finger
  landing on a row selected it instantly, and `preventDefault` on `pointerdown` suppresses the
  browser's own scrolling. Selection now happens on `click`, which fires only after a press and
  release without significant travel — the browser's built-in tap-versus-drag discrimination does the
  work. Focus is still held, but via `mousedown` only, which iOS synthesises _after_ `touchend` and so
  cannot block a scroll. `pointerenter` no longer moves the active option for touch pointers, which
  would otherwise drag the highlight along with the finger.

  Every existing test passed while this was broken: `user.click()` and Playwright's `.click()` both
  fire the full pointerdown → pointerup → click sequence. Three regression tests now assert that
  pointerdown alone does _not_ select, and a CDP-driven touch drag verifies real scrolling.

- **Service-worker caches are now versioned per build.** `CACHE_VERSION` was hardcoded `'v1'`, so a
  deploy never retired the previous caches and a device could keep serving an older build's assets
  indefinitely — stale UI while believing you were on the current release. The build id now rides in
  the registration URL (`/sw.js?v=…`), so a new deploy installs a new worker and its `activate`
  handler purges every cache outside the current set.

- **`theme-color` is now per colour scheme.** It was fixed brand blue, so the browser toolbar stayed
  blue in dark mode instead of following the theme.

### Note on the dark-mode report

The shipped stylesheet was checked end to end and is correct: `.bg-surface` resolves to
`var(--pl-surface)`, the `prefers-color-scheme: dark` block redefines those variables, and the dark
`:root` rule is ordered _after_ the light one. No `light-dark()` is emitted. Dark mode renders
correctly under emulation.

**It was not possible to reproduce the failure on a real WebKit engine** — this environment cannot
download one. The service-worker versioning fix above is the most likely cause (a device pinned to
pre-dark-mode assets), but that is a hypothesis, not a confirmed diagnosis.

### Added — SEO (Phase 2, feature 1 of 8)

- **Metadata**: canonical URL, keywords, and a title template, all resolved against a real origin
- **Open Graph + Twitter Cards** with a `summary_large_image` card
- **`public/og.png`** — a 1200×630 link-preview card, rendered once with Chromium by
  `scripts/generate-og-image.mjs` and committed as a static asset. Deliberately not generated per
  request with `next/og`: a social card changes about as often as the logo, so paying a serverless
  render for every crawler hit buys nothing.
- **`app/robots.ts`** — disallows `/design-system` (internal) and `/api/` (JSON with no standalone
  meaning, and crawling it would load the rate provider through our proxy)
- **`app/sitemap.ts`** — one honest entry, because the product is one screen
- **`config/site.ts`** — resolves the public origin from `NEXT_PUBLIC_SITE_URL`, then Vercel's
  `VERCEL_PROJECT_PRODUCTION_URL`, then localhost. Preview deployments therefore never advertise
  themselves as canonical, and deployment still needs zero configuration.

### Verified

- `lint`, `typecheck`, **148 tests**, `format:check`, `build` — all clean; no existing behaviour touched
- `robots.txt`, `sitemap.xml`, canonical, OG and Twitter tags all checked in the built output, with
  and without a build-time origin set

### Added — Production polish

- **Dark mode**, system-detected via `prefers-color-scheme`. No toggle and no stored preference: the
  browser resolves the theme before first paint, so there is no flash of the wrong one. Every pairing
  measured at WCAG AA in both themes before it was written.
- **Two-layer colour tokens** — a fixed raw palette plus semantic roles (`surface`, `fg`, `outline`,
  `accent`) that resolve per theme. Dark mode is a palette swap, not a `dark:` variant on every
  element.
- **`Flag` component** with a real fallback: emoji flags render beautifully on iOS, Android and
  macOS, but **Windows ships no flag glyphs at all** and draws two bare letters. Support is detected
  once via canvas metrics; where it is missing, a deliberate country-code chip is shown instead. No
  images, no sprite sheet, no dependency.
- **Clear button** on the amount field, appearing only when there is something to clear.
- **Empty state** — the result recedes to muted rather than reading as a computed zero.
- **Micro-interactions**: 140ms rise on a new result (the digits never animate), a swap icon that
  keeps rotating the same way on repeated taps, and a 1–5% press response on buttons. All respect
  `prefers-reduced-motion`.

### Fixed

- **The conversion result was rendering at 16px instead of 48px** — since Phase 4. `tailwind-merge`
  classifies any unrecognised `text-*` value as a colour, so the custom `text-display-sm` font-size
  token collided with `text-fg` and was silently dropped. `cn()` now extends tailwind-merge with the
  project's custom font-size tokens. Any future custom `--text-*` token must be registered there too.
- **The answer fell below the fold on an iPhone SE.** Spacing was desktop-generous applied at every
  size; it is now compact-first and expands from `md`. The result is above the fold on every phone
  tested, and iPhone 13 and Pixel 5 need no scrolling at all.
- The result card reserved 88px for a 48px line, leaving ~40px of dead space under the number.

### Verified

- `lint`, `typecheck`, **148 tests**, `format:check`, `build` — all clean, and **no test was modified**
- **axe: 0 violations** across 8 states — light and dark, mobile/desktop/320px, empty, error, and the
  open country picker
- Bundle +2.8KB gzipped (tailwind-merge config, flag fallback); **no new dependencies**. Dark mode is
  CSS-only.

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
