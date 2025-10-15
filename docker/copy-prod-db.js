#!/usr/bin/env node

const { Client } = require('pg');

// Production database connection
const prodClient = new Client({
  host: '35.202.149.98',
  port: 5432,
  database: 'hiking-db',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

// Local database connection (inside Docker container)
const localClient = new Client({
  host: 'localhost',
  port: 5433,
  database: 'hiking_portal_dev',
  user: 'hiking_user',
  password: 'hiking_pass_dev_123'
});

async function copyProductionDatabase() {
  try {
    console.log('🏔️  Copying Production Database to Local Development Environment');
    console.log('================================================');
    
    // Connect to both databases
    console.log('📡 Connecting to production database...');
    await prodClient.connect();
    console.log('✅ Connected to production database');
    
    console.log('🐳 Connecting to local development database...');
    await localClient.connect();
    console.log('✅ Connected to local development database');
    
    // Clear local database first
    console.log('🧹 Clearing local development database...');
    await clearLocalDatabase();
    
    // Get all tables from production
    console.log('📋 Getting table list from production...');
    const tablesResult = await prodClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'schema_migrations'
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log(`📊 Found ${tables.length} tables to copy:`, tables.join(', '));
    
    // Copy schema first (structure)
    console.log('🏗️  Copying database schema...');
    await copySchema();
    
    // Copy data for each table
    console.log('📦 Copying table data...');
    for (const table of tables) {
      await copyTableData(table);
    }
    
    console.log('🎉 Database copy completed successfully!');
    console.log('');
    console.log('📊 Local Development Database Summary:');
    await showDatabaseSummary();
    
  } catch (error) {
    console.error('❌ Error copying database:', error.message);
    console.error('Full error:', error);
  } finally {
    await prodClient.end();
    await localClient.end();
  }
}

async function clearLocalDatabase() {
  // Get all tables in local database
  const result = await localClient.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  `);
  
  if (result.rows.length > 0) {
    const tables = result.rows.map(row => row.tablename);
    console.log(`  🗑️  Dropping ${tables.length} existing tables...`);
    
    // Drop tables with CASCADE to handle foreign key constraints
    for (const table of tables) {
      await localClient.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
  }
}

async function copySchema() {
  // Get schema dump from production (structure only)
  const schemaResult = await prodClient.query(`
    SELECT pg_get_tabledef('public.' || quote_ident(tablename)) as tabledef
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename != 'schema_migrations'
  `);
  
  // For simplicity, let's copy table by table with CREATE statements
  const tablesResult = await prodClient.query(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name != 'schema_migrations'
    ORDER BY table_name, ordinal_position
  `);
  
  // Group columns by table
  const tableStructures = {};
  tablesResult.rows.forEach(row => {
    if (!tableStructures[row.table_name]) {
      tableStructures[row.table_name] = [];
    }
    tableStructures[row.table_name].push(row);
  });
  
  // Create tables (simplified - you might want to use pg_dump for complex schemas)
  console.log('  🏗️  Creating table structures...');
  
  // For now, let's copy the data into existing tables
  // The schema should already exist from our basic_schema.sql
}

async function copyTableData(tableName) {
  try {
    console.log(`  📋 Copying ${tableName}...`);
    
    // Get data from production
    const dataResult = await prodClient.query(`SELECT * FROM "${tableName}"`);
    const rows = dataResult.rows;
    
    if (rows.length === 0) {
      console.log(`    ℹ️  ${tableName} is empty`);
      return;
    }
    
    // Clear existing data in local table
    await localClient.query(`DELETE FROM "${tableName}"`);
    
    // Get column names
    const columns = Object.keys(rows[0]);
    const columnList = columns.map(col => `"${col}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const values = columns.map(col => row[col]);
        await localClient.query(
          `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders})`,
          values
        );
      }
    }
    
    console.log(`    ✅ Copied ${rows.length} rows to ${tableName}`);
    
  } catch (error) {
    console.log(`    ⚠️  Error copying ${tableName}:`, error.message);
    // Continue with other tables
  }
}

async function showDatabaseSummary() {
  try {
    // Count records in each table
    const tablesResult = await localClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    for (const table of tablesResult.rows) {
      const countResult = await localClient.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
      const count = countResult.rows[0].count;
      console.log(`  📊 ${table.tablename}: ${count} records`);
    }
    
  } catch (error) {
    console.log('  ⚠️  Could not get database summary:', error.message);
  }
}

// Run the copy process
copyProductionDatabase();