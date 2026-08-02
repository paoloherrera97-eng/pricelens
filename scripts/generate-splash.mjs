// Generates the iOS launch screens ("apple-touch-startup-image").
//
// Android and desktop Chrome build a launch screen themselves from the manifest
// (`background_color` plus the icon). iOS does not: a home-screen web app with
// no startup image opens on a blank white screen, which on a dark-themed phone
// is a white flash before a dark app. The only way to control it is to ship one
// image per device resolution, matched by a media query that must state the
// device's exact CSS width, height and pixel ratio — a near miss matches
// nothing and you are back to white.
//
// So this renders exactly what Android generates from the manifest: the app
// background with the icon tile centred. The two platforms then look the same
// on launch, which is worth more than a distinct treatment on one of them.
//
// Writes both the images and `config/splash.ts`, so the device matrix has a
// single source of truth — the same generated-config pattern as countries and
// currencies.

import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

import { renderMark } from './lib/mark.mjs';
import { encodePng } from './lib/png.mjs';

/** `--pl-bg` in each theme (app/globals.css). */
const BG = {
  light: [0xf8, 0xfa, 0xfc],
  dark: [0x0a, 0x0e, 0x16],
};

/**
 * Portrait launch sizes, as [CSS width, CSS height, device pixel ratio].
 *
 * Portrait only, because the manifest locks the app to `orientation:
 * "portrait"`. Every iPhone still in circulation is here plus the current iPad
 * sizes; a device missing from this list simply gets the old white screen, so
 * the list errs towards being long.
 */
const DEVICES = [
  // iPhone
  [320, 568, 2], // SE (1st gen), 5s
  [375, 667, 2], // SE (2nd/3rd gen), 6/7/8
  [414, 736, 3], // 8 Plus
  [375, 812, 3], // X, XS, 11 Pro, 12/13 mini
  [414, 896, 2], // XR, 11
  [414, 896, 3], // XS Max, 11 Pro Max
  [390, 844, 3], // 12, 12 Pro, 13, 13 Pro, 14
  [428, 926, 3], // 12/13 Pro Max, 14 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [402, 874, 3], // 16 Pro
  [440, 956, 3], // 16 Pro Max
  // iPad
  [768, 1024, 2], // 9.7"
  [810, 1080, 2], // 10.2"
  [820, 1180, 2], // Air 10.9"
  [834, 1112, 2], // Pro 10.5"
  [834, 1194, 2], // Pro 11"
  [1024, 1366, 2], // Pro 12.9"
];

/** Icon tile edge, as a fraction of the shorter side. Matches Android's. */
const TILE_RATIO = 0.3;

function renderSplash(width, height, background) {
  const tile = Math.round(Math.min(width, height) * TILE_RATIO);
  // The tile is drawn against the splash background so its antialiased corners
  // blend into it instead of leaving a pale fringe.
  const mark = renderMark(tile, { rounded: true, inset: 0, outside: background });

  const left = Math.round((width - tile) / 2);
  const top = Math.round((height - tile) / 2);

  const px = new Array(width * height);
  for (let y = 0; y < height; y++) {
    const inTileRow = y >= top && y < top + tile;
    for (let x = 0; x < width; x++) {
      px[y * width + x] =
        inTileRow && x >= left && x < left + tile
          ? mark[(y - top) * tile + (x - left)]
          : background;
    }
  }
  return px;
}

const outDir = new URL('../public/splash/', import.meta.url);
mkdirSync(outDir, { recursive: true });
// Stale files would ship forever otherwise — nothing else ever deletes them.
for (const file of readdirSync(outDir)) unlinkSync(new URL(file, outDir));

const entries = [];
let total = 0;

for (const [cssWidth, cssHeight, ratio] of DEVICES) {
  const width = cssWidth * ratio;
  const height = cssHeight * ratio;

  for (const scheme of ['light', 'dark']) {
    const name = `splash-${width}x${height}${scheme === 'dark' ? '-dark' : ''}.png`;
    const pixels = renderSplash(width, height, BG[scheme]);
    // Whichever row filter deflate likes better for this particular canvas.
    // `None` usually wins here — a flat row of one repeated colour is already
    // ideal input — but `Up` wins on some sizes, and measuring is cheaper than
    // reasoning about it.
    const [buf] = [
      encodePng(width, height, pixels, { filter: 0 }),
      encodePng(width, height, pixels, { filter: 2 }),
    ].sort((a, b) => a.length - b.length);
    writeFileSync(new URL(name, outDir), buf);
    total += buf.length;

    entries.push({
      url: `/splash/${name}`,
      // The light image carries no colour-scheme condition, so it always
      // matches and acts as the fallback. The dark one is emitted after it and
      // only matches in dark mode, so it wins there — and on an engine that
      // ignores `prefers-color-scheme` here, the light image still applies
      // rather than nothing at all.
      media:
        `(device-width: ${cssWidth}px) and (device-height: ${cssHeight}px) ` +
        `and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)` +
        (scheme === 'dark' ? ' and (prefers-color-scheme: dark)' : ''),
    });
  }
}

// Light first, then dark, so a dark match is always the later declaration.
entries.sort((a, b) => Number(a.media.includes('dark')) - Number(b.media.includes('dark')));

const ts = `// GENERATED by scripts/generate-splash.mjs — do not edit by hand.
//
// iOS launch screens. See the generator for why every device needs its own
// image and its own exact media query.

export interface SplashScreen {
  readonly url: string;
  readonly media: string;
}

export const SPLASH_SCREENS: readonly SplashScreen[] = ${JSON.stringify(entries, null, 2)};
`;

// Run the emitted file through Prettier rather than trying to hand-match its
// output: `format:check` covers config/, so a generator that guesses at quote
// style breaks the build the next time it runs. The project's own config has to
// be resolved explicitly — `format` does not read .prettierrc on its own.
const target = fileURLToPath(new URL('../config/splash.ts', import.meta.url));
const prettierOptions = await resolveConfig(target);
writeFileSync(target, await format(ts, { ...prettierOptions, filepath: target }));

console.log(
  `${entries.length} launch screens for ${DEVICES.length} devices, ` +
    `${(total / 1024).toFixed(0)}KB total`,
);
