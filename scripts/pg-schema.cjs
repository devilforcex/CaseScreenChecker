const { Client } = require('pg');

async function run() {
  const password = encodeURIComponent(`@fY'd;DKHb4NNmI-`);
  const connStr = `postgresql://postgres:${password}@db.mmnbybisijobjggginwj.supabase.co:5432/postgres`;
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
