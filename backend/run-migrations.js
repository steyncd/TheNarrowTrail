const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of executed migrations
    const result = await client.query('SELECT version FROM schema_migrations');
    const executedMigrations = new Set(result.rows.map(row => row.version));
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    // Run each migration
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`✓ ${file} (already executed)`);
        continue;
      }
      
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✓ ${file} completed`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ ${file} failed:`, error.message);
        throw error;
      }
    }
    
    console.log('\nAll migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
