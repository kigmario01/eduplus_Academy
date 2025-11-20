/**
 * Test de integración básico para evaluation-service
 * Verifica que el servicio responda 200 en /api/evaluations/health
 */

const EVAL_URL = process.env.EVAL_URL || 'http://localhost:5005';

describe('Evaluation Service Integration', () => {
  it('GET /api/evaluations/health debe responder 200', async () => {
    const res = await fetch(`${EVAL_URL}/api/evaluations/health`);
    expect(res.status).toBe(200);
  });
});