// Run Migration 025 - Update tags to be South African-focused
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
  console.log('Running Migration 025');
  console.log('Update tags to South African context');
  console.log('========================================\n');

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', '025_update_tags_south_african_v2.sql'),
      'utf8'
    );

    console.log('Executing SQL migration...\n');
    await pool.query(sql);

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');
    console.log('New tag categories added:');
    console.log('  ✓ Target Audience (Family, Mens, Ladies, Mixed, etc.)');
    console.log('  ✓ South African Locations (Provinces, Cities, Landmarks)');
    console.log('  ✓ SA-Specific Activities (Braai, Game Drive, Wine Tasting)');
    console.log('  ✓ Terrain Types (Bushveld, Fynbos, Grassland)');
    console.log('  ✓ Difficulty, Duration, Cost, Season tags\n');

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
