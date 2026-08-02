import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom implements no layout, so `scrollIntoView` does not exist on elements.
 * Stubbing it here rather than guarding in component code keeps a test-
 * environment gap out of the product.
 */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

/**
 * Home-currency detection reads `navigator.language`, and jsdom reports the
 * runner's own locale — `en-US` here, something else on another machine. That
 * would make the app's default home currency depend on where the tests happen
 * to run, so the baseline is pinned to a language with no region: detection
 * finds nothing and the configured default stands.
 *
 * Tests that care about detection set a locale themselves; `restoreAllMocks`
 * returns them to this. The timezone half is pinned in vitest.config.mts.
 */
Object.defineProperty(navigator, 'language', {
  get: () => 'es',
  configurable: true,
});

afterEach(() => {
  cleanup();
});
