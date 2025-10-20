const { Pool } = require('pg');

const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'hiking_portal',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: false
});

async function getSchema() {
  const client = await pool.connect();
  try {
    // Get hikes table structure
    const result = await client.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'hikes'
      ORDER BY ordinal_position
    `);

    console.log('HIKES TABLE STRUCTURE:');
    console.log('======================\n');
    result.rows.forEach(row => {
      console.log(`${row.column_name}:`);
      console.log(`  Type: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
      console.log(`  Nullable: ${row.is_nullable}`);
      if (row.column_default) console.log(`  Default: ${row.column_default}`);
      console.log('');
    });

    // Get related tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name LIKE '%hike%'
      ORDER BY table_name
    `);

    console.log('\nHIKE-RELATED TABLES:');
    console.log('====================');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

getSchema().catch(console.error);
