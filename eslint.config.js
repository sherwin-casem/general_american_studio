import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/', 'node_modules/']),
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['public/sw.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.serviceworker } },
  },
  {
    files: ['vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Command-line tools: Node globals, and printing progress is their job.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
]);
