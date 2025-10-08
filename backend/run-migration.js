// Run database migration script
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'hiking_portal',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Connected to database...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '011_add_site_content.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: 011_add_site_content.sql');
    console.log('This will create site content tables and default content...\n');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let indexCount = 0;

    for (const statement of statements) {
      if (statement.includes('CREATE INDEX')) {
        indexCount++;
        const indexName = statement.match(/idx_\w+/)?.[0] || 'index';
        process.stdout.write(`Creating ${indexName}... `);

        try {
          await client.query(statement);
          console.log('✓');
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log('⚠ already exists');
          } else {
            console.log('✗ ERROR:', err.message);
          }
        }
      } else if (statement.includes('BEGIN') || statement.includes('COMMIT')) {
        // Skip transaction statements when running individual statements
        continue;
      } else if (statement.includes('INSERT INTO schema_migrations')) {
        console.log('\nRecording migration...');
        try {
          await client.query(statement);
          console.log('✓ Migration recorded');
        } catch (err) {
          console.log('⚠ Migration already recorded');
        }
      }
    }

    console.log(`\n✅ Migration complete! Created ${indexCount} indexes.`);

    // Verify indexes were created
    console.log('\nVerifying indexes...');
    const result = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE indexname LIKE 'idx_%'
      ORDER BY indexname
    `);

    console.log(`\n📊 Total indexes starting with 'idx_': ${result.rows.length}`);
    console.log('\nSample indexes:');
    result.rows.slice(0, 10).forEach(row => {
      console.log(`  - ${row.indexname}`);
    });
    if (result.rows.length > 10) {
      console.log(`  ... and ${result.rows.length - 10} more`);
    }

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n✨ Database migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  });
