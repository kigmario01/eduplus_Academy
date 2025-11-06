const db = require('../db');

async function notifyUser({ userId, type, payload }) {
  await db.query(
    'INSERT INTO evaluation_notifications (user_id, type, payload) VALUES ($1, $2, $3)',
    [userId, type, JSON.stringify(payload)]
  );
}

module.exports = { notifyUser };