const { Client } = require('pg');

async function run() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL is required. Refusing to connect with an embedded credential.');
  }

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DB_INSPECTION !== 'true') {
    throw new Error('Set ALLOW_PRODUCTION_DB_INSPECTION=true to inspect a production database.');
  }
  const client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await client.end();
  }
}
run();
