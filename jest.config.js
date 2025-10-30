/**
 * Jest configuration using Next.js preset to correctly transform TypeScript/TSX,
 * and map the `@/*` alias to the `src` directory.
 */
const nextJest = require('next/jest');

// Create Next.js-aware Jest config generator
const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

module.exports = createJestConfig(customJestConfig);
