/**
 * Configuración de Jest para tests de integración
 * Asegura compatibilidad con ESM y fetch global
 * Renombrado a .cjs para evitar conflicto con "type": "module"
 */

export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: [],
  transform: {},
  testMatch: [
    '<rootDir>/services/**/*.integration.test.js'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Habilitar ESM para setup y tests
  injectGlobals: true,
  // No transformar nada (ESM nativo)
  transformIgnorePatterns: ['/node_modules/']
};