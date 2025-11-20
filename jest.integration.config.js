module.exports = {
  testEnvironment: "node",
  injectGlobals: true,
  roots: ["<rootDir>/tests/integration"],
  testMatch: ["**/*.test.js"],
  transform: {},
  modulePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.vite/",
    "<rootDir>/dist/",
    "<rootDir>/build/"
  ],
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "<rootDir>/coverage/integration"
};
