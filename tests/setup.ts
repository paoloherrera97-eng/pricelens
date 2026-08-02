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

afterEach(() => {
  cleanup();
});
