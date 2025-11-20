/**
 * Punto de entrada de tests de integración
 * Ejecuta todos los tests de integración de servicios
 */

import { jest } from '@jest/globals';

beforeAll(() => {
  // Aumentar timeout global para levantar servicios
  jest.setTimeout(30000);
});

// Importar suites de tests
import './services/auth-service/auth.integration.test.js';
import './services/course-service/course.integration.test.js';
import './services/evaluation-service/evaluation.integration.test.js';