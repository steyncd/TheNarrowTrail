const { Pool } = require('pg');

const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

async function listDatabases() {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname');
    console.log('Available databases:');
    result.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

listDatabases();
