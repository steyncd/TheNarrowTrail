// check-database-status.js - Quick database status check
require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Checking Database Status...\n');

// Create pool with current config
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hiking_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
});

async function checkStatus() {
  try {
    console.log('📊 Database Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'hiking_portal'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.log('');

    // Test connection
    console.log('🔌 Testing connection...');
    const result = await pool.query('SELECT NOW(), current_database(), current_user');
    console.log('✅ Database connection successful!');
    console.log(`   Time: ${result.rows[0].now}`);
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);
    console.log('');

    // Check for permission system tables
    console.log('🗄️  Checking for permission system tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('permissions', 'roles', 'role_permissions', 'user_roles')
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.log('❌ Permission system tables NOT FOUND');
      console.log('   The migrations may not have run on this database.');
      console.log('');
      console.log('💡 To run migrations:');
      console.log('   cd backend');
      console.log('   node run-migration.js 018_add_user_management_indexes.sql');
      console.log('   node run-migration.js 017_create_permission_system.sql');
    } else {
      console.log(`✅ Found ${tables.rows.length}/4 permission tables:`);
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      if (tables.rows.length === 4) {
        // Check permissions count
        const permCount = await pool.query('SELECT COUNT(*) FROM permissions');
        const roleCount = await pool.query('SELECT COUNT(*) FROM roles');
        const userRoleCount = await pool.query('SELECT COUNT(*) FROM user_roles');

        console.log('');
        console.log('📊 Data Summary:');
        console.log(`   Permissions: ${permCount.rows[0].count}`);
        console.log(`   Roles: ${roleCount.rows[0].count}`);
        console.log(`   User-Role assignments: ${userRoleCount.rows[0].count}`);

        if (parseInt(permCount.rows[0].count) >= 35) {
          console.log('');
          console.log('🎉 Migration appears COMPLETE and SUCCESSFUL!');
          console.log('');
          console.log('✅ Next steps:');
          console.log('   1. Restart the backend server (if running)');
          console.log('   2. Test API endpoints');
          console.log('   3. Verify permissions are working');
        } else {
          console.log('');
          console.log('⚠️  Warning: Expected 35+ permissions, found only ' + permCount.rows[0].count);
          console.log('   The migration may be incomplete.');
        }
      }
    }

    // Check for indexes
    console.log('');
    console.log('⚡ Checking for performance indexes...');
    const indexes = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'permissions', 'roles', 'role_permissions', 'user_roles')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);

    console.log(`✅ Found ${indexes.rows.length} performance indexes`);
    if (indexes.rows.length >= 12) {
      console.log('   All expected indexes are present');
    } else {
      console.log(`   ⚠️  Expected 12+ indexes, found ${indexes.rows.length}`);
    }

    // Check for views
    console.log('');
    console.log('👁️  Checking for helper views...');
    const views = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN ('role_permissions_view', 'user_permissions_view')
    `);

    if (views.rows.length === 2) {
      console.log('✅ Both helper views found');
      views.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log(`⚠️  Expected 2 views, found ${views.rows.length}`);
    }

    console.log('');
    console.log('═'.repeat(70));
    console.log('✅ Database Status Check Complete');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Possible issues:');
    console.log('   1. Database server is not running');
    console.log('   2. Connection credentials are incorrect');
    console.log('   3. Database does not exist');
    console.log('   4. Firewall is blocking connection');
    console.log('');
    console.log('🔧 To troubleshoot:');
    console.log('   - Check if PostgreSQL is running');
    console.log('   - Verify .env file settings');
    console.log('   - Test connection with psql or pgAdmin');
  } finally {
    await pool.end();
  }
}

checkStatus();
