// ESLint v9 flat config using legacy compatibility for popular configs.
// This setup covers Next.js core web vitals, TypeScript, a11y, Testing Library, Jest DOM, and Tailwind.

const { FlatCompat } = require('@eslint/eslintrc');

const js = require('@eslint/js');

const typescriptPlugin = require('@typescript-eslint/eslint-plugin');

const typescriptParser = require('@typescript-eslint/parser');

const jsxA11y = require('eslint-plugin-jsx-a11y');

const testingLibrary = require('eslint-plugin-testing-library');

const jestDom = require('eslint-plugin-jest-dom');

const tailwindcss = require('eslint-plugin-tailwindcss');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  // JavaScript recommended rules
  js.configs.recommended,

  // Bring in legacy configs via compat
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended'
  ),
  // Disable formatting-related ESLint rules in favor of Prettier
  ...compat.extends('prettier'),

  // Global settings and rules
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'jsx-a11y': jsxA11y,
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
      tailwindcss,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'padding-line-between-statements': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Next.js Link uses custom anchor behavior.
      'jsx-a11y/anchor-is-valid': 'off',
      // Tailwind suggestions:
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',
    },
  },

  // Test file overrides
  {
    files: ['**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Tailwind config file can use CommonJS require imports safely.
  {
    files: ['tailwind.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Node-based config files (CJS) should allow require/module/__dirname globals
  {
    files: ['*.config.*', 'jest.config.*'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },

  // Ignore patterns (replaces .eslintignore in ESLint v9)
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'coverage/',
      'prisma/dev.db',
      'prisma/dev.db-journal',
      '.turbo/',
      '*.config.js.timestamp-*',
    ],
  },
];
