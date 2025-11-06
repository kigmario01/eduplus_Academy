import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

const hasDb = !!process.env.DATABASE_URL;

describe('Auth Service Integration', () => {
  test('GET /health responde OK con conexión DB', async () => {
    if (!hasDb) {
      console.warn('⚠️ DATABASE_URL no configurado. Saltando prueba de /health.');
      return;
    }
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'auth-service');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status', 'Connected');
  });

  test('POST /api/auth/register y /api/auth/login funcionan', async () => {
    if (!hasDb) {
      console.warn('⚠️ DATABASE_URL no configurado. Saltando prueba de register/login.');
      return;
    }

    const rnd = Math.random().toString(36).slice(2);
    const testUser = {
      name: 'Test',
      lastname: 'User',
      email: `itest_${rnd}@example.com`,
      password: 'TestPass123!',
      role: 'student',
    };

    // Registro
    const reg = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('message');
    expect(reg.body).toHaveProperty('user');
    expect(reg.body.user).toHaveProperty('email', testUser.email);

    // Login
    const log = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(log.status).toBe(200);
    expect(log.body).toHaveProperty('token');
    expect(log.body).toHaveProperty('user');

    // Limpieza: eliminar el usuario de prueba
    try {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (e) {
      console.warn('⚠️ No se pudo limpiar el usuario de prueba:', e.message);
    }
  });

  afterAll(async () => {
    if (hasDb) {
      try {
        await pool.end();
      } catch (e) {
        // ignore
      }
    }
  });
});