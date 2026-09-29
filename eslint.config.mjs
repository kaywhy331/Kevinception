// ESLint flat config. Run with `npm run lint`.
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.next/**', 'out/**', 'artifacts/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts', 'public/legacy/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['scripts/**/*.mjs', 'deploy/**/*.js', '*.mjs', '*.config.{ts,mjs}'],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    // Puppeteer probes pass callbacks that run inside the page.
    files: ['scripts/runtime-*.mjs', 'scripts/capture-*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  },
  {
    // CloudFront Functions define `handler` for the runtime to call.
    files: ['deploy/cloudfront-viewer-request.js'],
    languageOptions: { sourceType: 'script' },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^handler$' }] }
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.node } }
  }
);
