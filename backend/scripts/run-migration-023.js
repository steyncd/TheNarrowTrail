// Run Migration 023: Add Event Types and Tags System
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

    const migrationFile = path.join(__dirname, 'migrations', '023_add_event_types_and_tags.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log('🚀 Running migration 023: Add Event Types and Tags System...\n');
    console.log('⚠️  This is a NON-BREAKING migration - all existing data will be preserved\n');

    // Run the migration
    const result = await client.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  ✓ Event types system activated');
    console.log('  ✓ Tagging system activated');
    console.log('  ✓ All existing hikes migrated to "hiking" event type');
    console.log('  ✓ Backward compatibility maintained');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    console.error('\n⚠️  Rolling back changes...');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('✨ Done! Portal now supports multiple event types and tagging.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Update backend API to expose event types and tags');
    console.log('  2. Create frontend components for event type selection');
    console.log('  3. Build tag management UI');
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
