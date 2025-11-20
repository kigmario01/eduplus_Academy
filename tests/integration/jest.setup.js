/**
 * Setup global para tests de integración
 * Asegura que fetch esté disponible en Node 18
 */

const { jest } = require('@jest/globals');

// fetch global para Node 18
if (!global.fetch) {
  throw new Error('Node 18+ requerido para fetch global');
}

// Aumentar timeout global
jest.setTimeout(30000);