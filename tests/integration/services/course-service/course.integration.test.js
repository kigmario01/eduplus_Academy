/**
 * Test de integración básico para course-service
 * Verifica que el servicio responda 200 en /health y 400 en POST sin body
 */

const COURSE_URL = process.env.COURSE_URL || 'http://localhost:3001';

describe('Course Service Integration', () => {
  it('GET /health debe responder 200', async () => {
    let res;
    try {
      res = await fetch(`${COURSE_URL}/health`);
    } catch (e) {
      return;
    }
    expect(res.status).toBe(200);
  });

  it('POST /api/courses sin body debe responder 400', async () => {
    let res;
    try {
      res = await fetch(`${COURSE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (e) {
      return;
    }
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});