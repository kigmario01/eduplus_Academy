import Joi from 'joi';
import db from '../config/db.js';

const feedbackSchema = Joi.object({
  content: Joi.string().min(3).max(2000).required()
});

// Crea la tabla de feedback si no existe
const ensureFeedbackTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  } catch (e) {
    // No lanzar error para no romper la petición si el modo sin DB está activo
    console.warn('⚠️ No se pudo verificar/crear la tabla feedback:', e?.message || e);
  }
};

export const feedbackController = {
  async list(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

      await ensureFeedbackTable();

      const result = await db.query(
        `SELECT f.id, f.content, f.created_at, u.id as user_id,
                (u.first_name || ' ' || u.last_name) as user_name,
                u.avatar_url as user_avatar
         FROM feedback f
         JOIN users u ON u.id = f.user_id
         ORDER BY f.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limitNum, offset]
      );

      const countRes = await db.query('SELECT COUNT(*) AS total FROM feedback');
      const total = parseInt(countRes.rows?.[0]?.total || '0', 10);

      res.json({
        success: true,
        data: {
          feedback: result.rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error listing feedback:', error);
      res.status(500).json({ success: false, message: 'Error al obtener feedback' });
    }
  },

  async create(req, res) {
    try {
      const { error, value } = feedbackSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Contenido inválido', errors: error.details });
      }

      await ensureFeedbackTable();

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      const insertRes = await db.query(
        `INSERT INTO feedback (user_id, content)
         VALUES ($1, $2)
         RETURNING id, content, created_at`,
        [userId, value.content]
      );

      const row = insertRes.rows[0];
      const userRes = await db.query(
        `SELECT (first_name || ' ' || last_name) as user_name, avatar_url as user_avatar
         FROM users WHERE id = $1`,
        [userId]
      );
      const userInfo = userRes.rows?.[0] || { user_name: 'Usuario', user_avatar: null };

      res.status(201).json({
        success: true,
        data: {
          id: row.id,
          content: row.content,
          created_at: row.created_at,
          user_id: userId,
          ...userInfo
        }
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ success: false, message: 'Error al crear feedback' });
    }
  }
};