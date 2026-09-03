/** Configuracion de Jest - Workshop Kiro */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
