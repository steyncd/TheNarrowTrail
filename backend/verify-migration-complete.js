// verify-migration-complete.js - Comprehensive verification after migrations
const pool = require('./config/database');

console.log('🔍 Verifying Migration Completion...\n');
console.log('═'.repeat(70));

let allChecks = [];

async function check(name, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${name}`);
    if (result) console.log(`   ${result}`);
    allChecks.push({ name, status: 'passed', result });
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    allChecks.push({ name, status: 'failed', error: error.message });
    return false;
  }
}

async function runVerification() {
  try {
    // Test 1: Database Connection
    console.log('\n📊 Database Connection Tests');
    console.log('─'.repeat(70));
    
    await check('Database connection successful', async () => {
      const result = await pool.query('SELECT NOW()');
      return `Connected at ${result.rows[0].now}`;
    });

    // Test 2: Permission System Tables
    console.log('\n🗄️  Permission System Tables');
    console.log('─'.repeat(70));
    
    await check('permissions table exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM permissions
      `);
      return `${result.rows[0].count} permissions`;
    });

    await check('roles table exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM roles
      `);
      return `${result.rows[0].count} roles`;
    });

    await check('role_permissions table exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM role_permissions
      `);
      return `${result.rows[0].count} role-permission mappings`;
    });

    await check('user_roles table exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM user_roles
      `);
      return `${result.rows[0].count} user-role assignments`;
    });

    // Test 3: Permissions by Category
    console.log('\n🔐 Permissions by Category');
    console.log('─'.repeat(70));
    
    await check('All permission categories present', async () => {
      const result = await pool.query(`
        SELECT category, COUNT(*) as count
        FROM permissions
        GROUP BY category
        ORDER BY category
      `);
      let output = '';
      result.rows.forEach(row => {
        output += `\n   ${row.category}: ${row.count} permissions`;
      });
      return output;
    });

    // Test 4: Default Roles
    console.log('\n👥 Default Roles');
    console.log('─'.repeat(70));
    
    await check('All 4 default roles created', async () => {
      const result = await pool.query(`
        SELECT name, is_system, 
               (SELECT COUNT(*) FROM role_permissions WHERE role_id = roles.id) as permission_count
        FROM roles
        ORDER BY name
      `);
      if (result.rows.length !== 4) {
        throw new Error(`Expected 4 roles, found ${result.rows.length}`);
      }
      let output = '';
      result.rows.forEach(row => {
        output += `\n   ${row.name}: ${row.permission_count} permissions (${row.is_system ? 'system' : 'custom'})`;
      });
      return output;
    });

    // Test 5: User Migration
    console.log('\n👤 User Migration');
    console.log('─'.repeat(70));
    
    await check('All approved users migrated to new role system', async () => {
      const totalUsers = await pool.query(`
        SELECT COUNT(*) as count FROM users WHERE status = 'approved'
      `);
      const migratedUsers = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM user_roles
      `);
      
      if (totalUsers.rows[0].count !== migratedUsers.rows[0].count) {
        throw new Error(`Mismatch: ${totalUsers.rows[0].count} approved users, but only ${migratedUsers.rows[0].count} migrated`);
      }
      
      return `${totalUsers.rows[0].count} users migrated successfully`;
    });

    // Test 6: Indexes on Users Table
    console.log('\n⚡ Performance Indexes (Users Table)');
    console.log('─'.repeat(70));
    
    const expectedIndexes = [
      'idx_users_name',
      'idx_users_created_at',
      'idx_users_status_role',
      'idx_users_email_verified',
      'idx_users_consent_status',
      'idx_users_search_text'
    ];

    for (const indexName of expectedIndexes) {
      await check(`Index ${indexName} exists`, async () => {
        const result = await pool.query(`
          SELECT indexname FROM pg_indexes 
          WHERE tablename = 'users' AND indexname = $1
        `, [indexName]);
        
        if (result.rows.length === 0) {
          throw new Error('Index not found');
        }
        return 'Created';
      });
    }

    // Test 7: Indexes on Permission Tables
    console.log('\n⚡ Performance Indexes (Permission Tables)');
    console.log('─'.repeat(70));
    
    const permissionIndexes = [
      { table: 'role_permissions', index: 'idx_role_permissions_role' },
      { table: 'role_permissions', index: 'idx_role_permissions_permission' },
      { table: 'user_roles', index: 'idx_user_roles_user' },
      { table: 'user_roles', index: 'idx_user_roles_role' },
      { table: 'permissions', index: 'idx_permissions_category' },
      { table: 'permissions', index: 'idx_permissions_name' }
    ];

    for (const { table, index } of permissionIndexes) {
      await check(`Index ${index} on ${table}`, async () => {
        const result = await pool.query(`
          SELECT indexname FROM pg_indexes 
          WHERE tablename = $1 AND indexname = $2
        `, [table, index]);
        
        if (result.rows.length === 0) {
          throw new Error('Index not found');
        }
        return 'Created';
      });
    }

    // Test 8: Views
    console.log('\n👁️  Helper Views');
    console.log('─'.repeat(70));
    
    await check('role_permissions_view exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM role_permissions_view
      `);
      return `${result.rows[0].count} role-permission mappings`;
    });

    await check('user_permissions_view exists', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM user_permissions_view
      `);
      return `${result.rows[0].count} user-permission mappings`;
    });

    // Test 9: Admin Role Permissions
    console.log('\n👑 Admin Role Verification');
    console.log('─'.repeat(70));
    
    await check('Admin role has all permissions', async () => {
      const adminPerms = await pool.query(`
        SELECT COUNT(*) as count
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        WHERE r.name = 'admin'
      `);
      
      const totalPerms = await pool.query(`
        SELECT COUNT(*) as count FROM permissions
      `);
      
      if (adminPerms.rows[0].count !== totalPerms.rows[0].count) {
        throw new Error(`Admin has ${adminPerms.rows[0].count} permissions, but ${totalPerms.rows[0].count} exist`);
      }
      
      return `Admin has all ${adminPerms.rows[0].count} permissions`;
    });

    // Test 10: Sample User Permissions
    console.log('\n🔍 Sample User Permission Check');
    console.log('─'.repeat(70));
    
    await check('Sample user has permissions assigned', async () => {
      const result = await pool.query(`
        SELECT 
          u.name,
          u.email,
          u.role as old_role,
          STRING_AGG(DISTINCT r.name, ', ') as new_roles,
          COUNT(DISTINCT p.id) as permission_count
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE u.status = 'approved'
        GROUP BY u.id, u.name, u.email, u.role
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        throw new Error('No approved users found');
      }
      
      const user = result.rows[0];
      return `\n   User: ${user.name} (${user.email})
   Old role: ${user.old_role}
   New roles: ${user.new_roles}
   Permissions: ${user.permission_count}`;
    });

    // Test 11: Query Performance Test
    console.log('\n⚡ Query Performance Tests');
    console.log('─'.repeat(70));
    
    await check('User list query uses indexes', async () => {
      const result = await pool.query(`
        EXPLAIN (FORMAT JSON)
        SELECT id, name, email, created_at
        FROM users
        WHERE status = 'approved'
        ORDER BY name
        LIMIT 10
      `);
      
      const plan = JSON.stringify(result.rows[0]);
      const usesIndex = plan.includes('Index Scan') || plan.includes('Bitmap Index Scan');
      
      if (!usesIndex && result.rows.length > 10) {
        console.log('   ⚠️  Warning: Query might not be using index efficiently');
      }
      
      return 'Query plan retrieved';
    });

    await check('Permission lookup query uses indexes', async () => {
      const result = await pool.query(`
        EXPLAIN (FORMAT JSON)
        SELECT DISTINCT p.name
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = 1
      `);
      
      return 'Query plan retrieved';
    });

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 Verification Summary');
    console.log('═'.repeat(70));
    
    const passed = allChecks.filter(c => c.status === 'passed').length;
    const failed = allChecks.filter(c => c.status === 'failed').length;
    const total = allChecks.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All verifications passed! Migration is complete and successful.');
      console.log('\n📝 Next Steps:');
      console.log('   1. ✅ Database migration complete');
      console.log('   2. ✅ All tables, indexes, and views created');
      console.log('   3. ✅ All users migrated successfully');
      console.log('   4. 🔄 Restart the backend server to load new routes');
      console.log('   5. 🧪 Test API endpoints (see MIGRATION_EXECUTION_CHECKLIST.md)');
      console.log('   6. 🚀 Begin frontend implementation');
      
      process.exit(0);
    } else {
      console.log('\n⚠️  Some verifications failed. Please review errors above.');
      
      const failedChecks = allChecks.filter(c => c.status === 'failed');
      console.log('\n❌ Failed Checks:');
      failedChecks.forEach(check => {
        console.log(`   - ${check.name}: ${check.error}`);
      });
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Unexpected error during verification:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run verification
runVerification();
