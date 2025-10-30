/**
 * Prettier configuration for Next.js + TypeScript project.
 * Includes Tailwind class sorting via prettier-plugin-tailwindcss.
 */
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  jsxSingleQuote: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
};
