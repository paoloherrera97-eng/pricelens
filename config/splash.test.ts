import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SPLASH_SCREENS } from './splash';

/**
 * These images are declared in `<head>` and fetched by iOS, never by anything
 * we render — so a broken entry produces no error, no warning and no failing
 * request in any test. It produces a white launch screen on a phone, which is
 * exactly the thing this feature exists to remove.
 *
 * The generated config and the generated files therefore have to be checked
 * against each other, because nothing else will notice.
 */
describe('splash screens', () => {
  const publicPath = (url: string) => join(process.cwd(), 'public', url);

  it('is generated, not hand-written into an empty list', () => {
    expect(SPLASH_SCREENS.length).toBeGreaterThan(0);
    // One light and one dark per device.
    expect(SPLASH_SCREENS.length % 2).toBe(0);
  });

  it.each(SPLASH_SCREENS)('ships the file $url', ({ url }) => {
    const path = publicPath(url);

    expect(existsSync(path), `${url} is declared but missing from public/`).toBe(true);
    expect(statSync(path).size).toBeGreaterThan(0);
  });

  it('names every file after the device pixels its media query claims', () => {
    for (const { url, media } of SPLASH_SCREENS) {
      const query =
        /\(device-width: (\d+)px\) and \(device-height: (\d+)px\) and \(-webkit-device-pixel-ratio: (\d+)\)/.exec(
          media,
        );
      expect(query, `unparseable media query for ${url}`).not.toBeNull();

      const [, width, height, ratio] = query!;
      const expected = `${Number(width) * Number(ratio)}x${Number(height) * Number(ratio)}`;

      // A near miss here is the whole failure mode: iOS matches on exact
      // dimensions, so a file that does not match its own query is a white
      // screen on that device and nowhere else.
      expect(url, `${url} does not match its own media query`).toContain(expected);
    }
  });

  it('declares every light variant before its dark counterpart', () => {
    // The light image carries no colour-scheme condition and so always matches;
    // dark only wins because it is declared later. Reordering silently disables
    // dark launch screens.
    const firstDark = SPLASH_SCREENS.findIndex(({ media }) =>
      media.includes('prefers-color-scheme'),
    );
    const lastLight = SPLASH_SCREENS.findLastIndex(
      ({ media }) => !media.includes('prefers-color-scheme'),
    );

    expect(firstDark).toBeGreaterThan(lastLight);
  });

  it('restricts every entry to portrait, matching the manifest orientation', () => {
    for (const { media } of SPLASH_SCREENS) {
      expect(media).toContain('(orientation: portrait)');
    }
  });
});
