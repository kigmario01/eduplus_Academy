import Joi from 'joi';
import db from '../config/db.js';

// Esquemas de validación
const conversationSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  course_id: Joi.number().integer().positive().optional(),
  participant_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

const messageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  message_type: Joi.string().valid('text', 'file', 'image').default('text'),
  file_url: Joi.string().uri().optional(),
  file_name: Joi.string().optional(),
  file_size: Joi.number().integer().positive().optional()
});

export const messageController = {
  // Crear una nueva conversación
  async createConversation(req, res) {
    try {
      const { error, value } = conversationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de conversación inválidos',
          errors: error.details
        });
      }

      const { title, course_id, participant_ids } = value;
      const creator_id = req.user.id;

      // Verificar que el creador esté incluido en los participantes
      if (!participant_ids.includes(creator_id)) {
        participant_ids.push(creator_id);
      }

      // Iniciar transacción
      const client = await db.connect();
      try {
        await client.query('BEGIN');

        // Crear la conversación
        const conversationResult = await client.query(
          `INSERT INTO conversations (title, course_id, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           RETURNING *`,
          [title, course_id, creator_id]
        );

        const conversation = conversationResult.rows[0];

        // Agregar participantes
        for (const participant_id of participant_ids) {
          await client.query(
            `INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
             VALUES ($1, $2, NOW())`,
            [conversation.id, participant_id]
          );
        }

        await client.query('COMMIT');

        // Obtener la conversación completa con participantes
        const fullConversation = await this.getConversationById(conversation.id);

        res.status(201).json({
          success: true,
          data: fullConversation
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la conversación'
      });
    }
  },

  // Obtener conversaciones del usuario
  async getUserConversations(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          c.*,
          co.title as course_title,
          u.first_name || ' ' || u.last_name as creator_name,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.conversation_id = c.id
              AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamp)
              AND m.sender_id != $1
          ) as unread_count,
          (
            SELECT m.content
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT m.created_at
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message_at
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        LEFT JOIN courses co ON c.course_id = co.id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE cp.user_id = $1
        ORDER BY COALESCE(
          (SELECT MAX(m.created_at) FROM messages m WHERE m.conversation_id = c.id),
          c.created_at
        ) DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [user_id, limit, offset]);

      // Contar total de conversaciones
      const countQuery = `
        SELECT COUNT(*)
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = $1
      `;
      const countResult = await db.query(countQuery, [user_id]);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          conversations: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las conversaciones'
      });
    }
  },

  // Obtener mensajes de una conversación
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const user_id = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      // Verificar que el usuario sea participante de la conversación
      const participantCheck = await db.query(
        `SELECT 1 FROM conversation_participants 
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, user_id]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }

      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          m.*,
          u.first_name || ' ' || u.last_name as sender_name,
          u.avatar_url as sender_avatar
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [conversationId, limit, offset]);

      // Marcar mensajes como leídos
      await db.query(
        `UPDATE conversation_participants 
         SET last_read_at = NOW()
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, user_id]
      );

      // Contar total de mensajes
      const countQuery = `
        SELECT COUNT(*) FROM messages WHERE conversation_id = $1
      `;
      const countResult = await db.query(countQuery, [conversationId]);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          messages: result.rows.reverse(), // Mostrar en orden cronológico
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los mensajes'
      });
    }
  },

  // Enviar un mensaje
  async sendMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const user_id = req.user.id;

      const { error, value } = messageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de mensaje inválidos',
          errors: error.details
        });
      }

      // Verificar que el usuario sea participante de la conversación
      const participantCheck = await db.query(
        `SELECT 1 FROM conversation_participants 
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, user_id]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }

      const { content, message_type, file_url, file_name, file_size } = value;

      // Insertar el mensaje
      const messageResult = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url, file_name, file_size, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [conversationId, user_id, content, message_type, file_url, file_name, file_size]
      );

      // Actualizar la fecha de última actividad de la conversación
      await db.query(
        `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
        [conversationId]
      );

      // Obtener información del remitente
      const senderResult = await db.query(
        `SELECT first_name || ' ' || last_name as sender_name, avatar_url as sender_avatar
         FROM users WHERE id = $1`,
        [user_id]
      );

      const message = {
        ...messageResult.rows[0],
        ...senderResult.rows[0]
      };

      // Crear notificaciones para otros participantes
      await this.createMessageNotifications(conversationId, user_id, message.id);

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar el mensaje'
      });
    }
  },

  // Obtener participantes de una conversación
  async getConversationParticipants(req, res) {
    try {
      const { conversationId } = req.params;
      const user_id = req.user.id;

      // Verificar que el usuario sea participante de la conversación
      const participantCheck = await db.query(
        `SELECT 1 FROM conversation_participants 
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, user_id]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }

      const query = `
        SELECT 
          u.id,
          u.first_name || ' ' || u.last_name as name,
          u.email,
          u.avatar_url,
          u.role,
          cp.joined_at,
          cp.last_read_at
        FROM conversation_participants cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = $1
        ORDER BY cp.joined_at ASC
      `;

      const result = await db.query(query, [conversationId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching conversation participants:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los participantes'
      });
    }
  },

  // Función auxiliar para obtener conversación por ID
  async getConversationById(conversationId) {
    const query = `
      SELECT 
        c.*,
        co.title as course_title,
        u.first_name || ' ' || u.last_name as creator_name
      FROM conversations c
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `;

    const result = await db.query(query, [conversationId]);
    return result.rows[0];
  },

  // Función auxiliar para crear notificaciones
  async createMessageNotifications(conversationId, senderId, messageId) {
    try {
      // Obtener todos los participantes excepto el remitente
      const participantsResult = await db.query(
        `SELECT user_id FROM conversation_participants 
         WHERE conversation_id = $1 AND user_id != $2`,
        [conversationId, senderId]
      );

      // Crear notificaciones para cada participante
      for (const participant of participantsResult.rows) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
           VALUES ($1, 'message', 'Nuevo mensaje', 'Tienes un nuevo mensaje en tu conversación', $2, NOW())`,
          [participant.user_id, messageId]
        );
      }
    } catch (error) {
      console.error('Error creating message notifications:', error);
    }
  }
};