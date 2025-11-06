const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => {
  console.error('Postgres Pool error:', err);
});

async function health() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  health,
};