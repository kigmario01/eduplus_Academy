// Pruebas de integración: Course Service
// Cómo ejecutar:
// 1) Arrancar la stack con Docker Compose: `docker compose up -d postgres course-service`
// 2) Ejecutar: `npm run test:integration`
// Variables opcionales:
//    TEST_COURSE_SERVICE_URL (por defecto http://localhost:5003)

const COURSE_URL = process.env.TEST_COURSE_SERVICE_URL || 'http://localhost:5003';

test('GET /api/courses responde 200', async () => {
  const res = await fetch(`${COURSE_URL}/api/courses`);
  expect(res.status).toBe(200);
});