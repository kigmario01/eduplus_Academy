/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  // Permite jest.mock() en ESM
  injectGlobals: true,

  // Directorios raíz para los microservicios
  roots: [
    "services/auth-service",
    "services/course-service",
    "services/evaluation-service",
  ],

  // Patrón de tests
  testMatch: ["**/tests/unit/**/*.test.js"],

  // Extensiones válidas
  moduleFileExtensions: ["js", "json"],

  // No transformamos nada (ESM nativo)
  transform: {},

  // Ignorar carpetas que rompen Jest
  modulePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.vite/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
  ],
};
