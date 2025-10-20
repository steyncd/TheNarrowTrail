// Run Migration 022: Fix Admin Permissions
// This script connects to the production database and runs the migration

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration (production)
const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'hiking_portal',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔌 Connected to production database');
    console.log('📁 Reading migration file...');

    const migrationFile = path.join(__dirname, 'migrations', '022_fix_admin_permissions.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log('🚀 Running migration 022...\n');

    // Run the migration
    const result = await client.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
