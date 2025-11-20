// Pruebas de integración: Evaluation Service
// Cómo ejecutar:
// 1) Arrancar la stack con Docker Compose: `docker compose up -d postgres evaluation-service`
// 2) Ejecutar: `npm run test:integration`
// Variables opcionales:
//    TEST_EVALUATION_SERVICE_URL (por defecto http://localhost:5005)

const EVAL_URL = process.env.TEST_EVALUATION_SERVICE_URL || 'http://localhost:5005';

test('GET /api/evaluations/health responde 200', async () => {
  const res = await fetch(`${EVAL_URL}/api/evaluations/health`);
  expect(res.status).toBe(200);
});