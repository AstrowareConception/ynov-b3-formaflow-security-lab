module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['apps/**/*.ts', 'packages/**/*.ts'],
  coverageDirectory: 'coverage',
  testTimeout: 15000,
};
