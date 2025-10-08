const { Pool } = require('pg');
const fs = require('fs');

// Connect to LIVE database
const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

async function dumpSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to LIVE database (hiking-db)...\n');
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables\n`);
    
    let schemaSQL = `-- Initial Schema Dump from Production Database
-- Generated: ${new Date().toISOString()}
-- Database: hiking-db
\n\n`;
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`Dumping schema for: ${tableName}`);
      
      // Get CREATE TABLE statement
      const createResult = await client.query(`
        SELECT 
          'CREATE TABLE ' || table_name || ' (' || 
          string_agg(
            column_name || ' ' || 
            CASE 
              WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
              WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
              ELSE UPPER(data_type)
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns
        WHERE table_name = $1
        GROUP BY table_name
      `, [tableName]);
      
      if (createResult.rows[0]) {
        schemaSQL += `-- Table: ${tableName}\n`;
        schemaSQL += createResult.rows[0].create_statement + '\n\n';
      }
      
      // Get indexes
      const indexResult = await client.query(`
        SELECT indexdef || ';' as index_statement
        FROM pg_indexes
        WHERE tablename = $1
        AND indexname NOT LIKE '%_pkey'
      `, [tableName]);
      
      indexResult.rows.forEach(idx => {
        schemaSQL += idx.index_statement + '\n';
      });
      
      schemaSQL += '\n';
    }
    
    // Get foreign keys
    const fkResult = await client.query(`
      SELECT
        'ALTER TABLE ' || tc.table_name || 
        ' ADD CONSTRAINT ' || tc.constraint_name ||
        ' FOREIGN KEY (' || kcu.column_name || ') ' ||
        'REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ')' ||
        CASE WHEN rc.delete_rule != 'NO ACTION' THEN ' ON DELETE ' || rc.delete_rule ELSE '' END ||
        ';' as fk_statement
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);
    
    if (fkResult.rows.length > 0) {
      schemaSQL += '-- Foreign Keys\n';
      fkResult.rows.forEach(fk => {
        schemaSQL += fk.fk_statement + '\n';
      });
    }
    
    // Write to file
    fs.writeFileSync('migrations/000_initial_schema.sql', schemaSQL);
    console.log('\n✓ Schema dumped to migrations/000_initial_schema.sql');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

dumpSchema();
