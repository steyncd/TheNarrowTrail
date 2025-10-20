// Quick migration script for 021
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/021_add_general_settings.sql', 'utf8');
    
    console.log('Running migration 021_add_general_settings.sql...');
    
    await pool.query(sql);
    
    console.log('✅ Migration 021 completed successfully!');
    
    // Verify settings were added
    const result = await pool.query(
      'SELECT COUNT(*) FROM system_settings WHERE category != \'weather\''
    );
    
    console.log(`📊 Total non-weather settings: ${result.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    console.error('Details:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
