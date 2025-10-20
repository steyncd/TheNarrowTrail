// Run migration 027 - Add event deadlines
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '35.202.149.98',
  user: 'postgres',
  password: '!Dobby1021',
  database: 'hiking_portal',
  port: 5432
});

async function runMigration() {
  try {
    console.log('🔄 Running Migration 027: Add event deadlines...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '027_add_event_deadlines.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Run migration
    await pool.query(migrationSQL);

    console.log('✅ Migration 027 completed successfully!\n');
    console.log('Added columns:');
    console.log('  - registration_deadline (TIMESTAMP)');
    console.log('  - payment_deadline (TIMESTAMP)');
    console.log('  - registration_closed (BOOLEAN)');
    console.log('  - pay_at_venue (BOOLEAN)\n');

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hikes'
      AND column_name IN ('registration_deadline', 'payment_deadline', 'registration_closed', 'pay_at_venue')
      ORDER BY column_name;
    `);

    console.log('Verification:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
