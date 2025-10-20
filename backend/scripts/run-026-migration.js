// Run Migration 026 - Fix event types and remove Target category tags
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: '35.202.149.98',
  database: 'hiking_portal',
  password: '!Dobby1021',
  port: 5432,
});

async function runMigration() {
  console.log('========================================');
  console.log('Running Migration 026');
  console.log('Fix event types and remove Target tags');
  console.log('========================================\n');

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', '026_fix_event_types_and_tags.sql'),
      'utf8'
    );

    console.log('Executing SQL migration...\n');
    await pool.query(sql);

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');
    console.log('Changes made:');
    console.log('  ✓ All events without event_type set to "hiking"');
    console.log('  ✓ Removed "Target" category tags (kept "Target Audience")\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
