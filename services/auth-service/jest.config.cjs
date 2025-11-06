module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.spec.js'],
  transform: {},
  setupFiles: ['dotenv/config'],
  verbose: true,
};