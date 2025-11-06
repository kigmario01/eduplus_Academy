const request = require('supertest');

jest.mock('../src/db', () => ({
  query: jest.fn(),
  health: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/middleware/auth', () => ({
  requireAuth: () => (req, res, next) => {
    req.user = { id: 123, role: 'student' };
    next();
  },
}));

const db = require('../src/db');
const app = require('../src/app');

describe('Certificates routes', () => {
  test('GET /api/evaluations/certificates/me returns certificates for authenticated student', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          evaluation_id: 10,
          student_id: 123,
          certificate_code: 'ABC123',
          payload: JSON.stringify({ course: { id: 7, title: 'Test' }, student: { name: 'Alice' } }),
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ],
    });

    const res = await request(app).get('/api/evaluations/certificates/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('certificates');
    expect(Array.isArray(res.body.certificates)).toBe(true);
    expect(res.body.certificates[0]).toMatchObject({ code: 'ABC123' });
  });

  test('GET /api/evaluations/certificates/:code returns certificate payload', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          certificate_code: 'XYZ999',
          payload: JSON.stringify({ course: { id: 99, title: 'Avanzado' }, student: { name: 'Bob' } }),
          created_at: '2024-02-02T00:00:00.000Z',
        },
      ],
    });

    const res = await request(app).get('/api/evaluations/certificates/XYZ999');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ code: 'XYZ999' });
    expect(res.body.payload).toHaveProperty('course');
  });

  test('GET /api/evaluations/certificates/:id/pdf returns PDF for owner', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          student_id: 123,
          certificate_code: 'PDF123',
          payload: JSON.stringify({ course: { title: 'Curso PDF' }, student: { name: 'Alice' } }),
          created_at: '2024-03-03T00:00:00.000Z',
        },
      ],
    });

    const res = await request(app).get('/api/evaluations/certificates/1/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body.length).toBeGreaterThan(100);
  });
});