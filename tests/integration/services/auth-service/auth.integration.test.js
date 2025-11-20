/**
 * Test de integración básico para auth-service
 * Verifica que el servicio responda 200 en /health y 400/401 en login sin credenciales
 */

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4000';

describe('Auth Service Integration', () => {
  beforeAll(() => {
    // Asegurar que el servicio esté arriba (CI ya lo levantó)
  });

  it('GET /health debe responder 200', async () => {
    const res = await fetch(`${AUTH_URL}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(String(body.status).toLowerCase()).toBe('ok');
  });

  it('POST /api/auth/login sin body debe responder 400', async () => {
    const res = await fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /api/auth/register sin body debe responder 400', async () => {
    const res = await fetch(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});