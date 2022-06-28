/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/test/*',
    '!src/types/*',
    '!**/type-helpers.ts'
  ],
  coverageReporters: [
    'text',
    'lcov'
  ],
  coverageDirectory: './coverage'
}
