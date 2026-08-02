import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

/**
 * The architecture boundaries in docs/ARCHITECTURE.md §5 are enforced here
 * rather than left to review discipline. A rule that only exists in a document
 * is a rule that erodes.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // "No `any`" is an engineering rule; make it fail the build.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // lib/ is pure: no React, no network, no framework. This is what keeps the
  // domain logic testable in milliseconds and reusable by a future native app.
  {
    files: ['lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'next',
                'next/*',
                '@/app/*',
                '@/components/*',
                '@/hooks/*',
                '@/services/*',
              ],
              message:
                'lib/ must stay pure: no React, no Next, no services. See docs/ARCHITECTURE.md §5.',
            },
          ],
        },
      ],
    },
  },

  // Components render; they do not fetch.
  {
    files: ['components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/*'],
              message: 'Components receive data via props or hooks. See docs/ARCHITECTURE.md §5.',
            },
          ],
        },
      ],
    },
  },

  // Services do I/O; they know nothing about React.
  {
    files: ['services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', '@/components/*', '@/hooks/*'],
              message: 'services/ must not depend on React. See docs/ARCHITECTURE.md §5.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'public/sw.js']),
]);

export default tseslint.config(...eslintConfig);
