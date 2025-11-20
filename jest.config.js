export default {
  testEnvironment: "node",

  // Soporte para ES Modules
  transform: {},

  moduleFileExtensions: ["js", "json"],

  roots: [
    "services/auth-service",
    "services/course-service",
    "services/evaluation-service"
  ],

  testMatch: ["**/tests/unit/**/*.test.js"],

  // Ignorar carpetas que rompen Jest
  modulePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.vite/",
    "<rootDir>/dist/",
    "<rootDir>/build/"
  ],

  // Para permitir jest.mock() en ESM
  injectGlobals: true
};