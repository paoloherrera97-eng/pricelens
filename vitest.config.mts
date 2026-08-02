import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    // Home-currency detection falls back to the device timezone, so an
    // unpinned TZ would make the app's default depend on the machine running
    // the suite. UTC names no country, which is the neutral baseline.
    env: { TZ: 'UTC' },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
    // Tests never touch the network — see docs/ARCHITECTURE.md §10. Anything
    // slower than this is a test doing something it shouldn't.
    testTimeout: 5000,
  },
});
