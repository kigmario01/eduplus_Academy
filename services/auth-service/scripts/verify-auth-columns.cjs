const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL no está definido');
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Conexión OK');
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name IN ('provider','provider_id')`
    );
    const cols = rows.map(r => r.column_name).sort();
    if (cols.length === 2) {
      console.log('🎉 Verificación OK: columnas presentes ->', cols.join(', '));
      process.exit(0);
    } else {
      console.log('⚠️ Faltan columnas. Encontradas ->', cols.join(', ') || 'ninguna');
      process.exit(2);
    }
  } catch (e) {
    console.error('❌ Error verificando columnas:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();