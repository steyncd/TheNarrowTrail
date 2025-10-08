const { Pool } = require('pg');

const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

async function checkStatus() {
  const client = await pool.connect();
  
  try {
    console.log('=== DATABASE STATUS ===\n');
    
    // Check if schema_migrations exists
    const schemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'schema_migrations'
      )
    `);
    
    if (schemaCheck.rows[0].exists) {
      console.log('✓ schema_migrations table exists\n');
      
      const migrations = await client.query('SELECT version, executed_at FROM schema_migrations ORDER BY version');
      console.log('Executed migrations:');
      migrations.rows.forEach(row => {
        console.log(`  - ${row.version} (${row.executed_at})`);
      });
    } else {
      console.log('✗ schema_migrations table does not exist\n');
    }
    
    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\nExisting tables (${tables.rows.length}):`);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkStatus();
