const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAdminPermissions() {
  try {
    const result = await pool.query(`
      SELECT p.name, p.category
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = (SELECT id FROM roles WHERE name = 'admin')
      ORDER BY p.category, p.name
    `);
    
    console.log(`Admin role has ${result.rows.length} permissions:`);
    console.log('');
    
    let currentCategory = '';
    result.rows.forEach(row => {
      if (row.category !== currentCategory) {
        currentCategory = row.category;
        console.log(`\n${currentCategory}:`);
      }
      console.log(`  - ${row.name}`);
    });
    
    console.log('');
    const hasUsersView = result.rows.some(r => r.name === 'users.view');
    const hasUsersManageRoles = result.rows.some(r => r.name === 'users.manage_roles');
    
    console.log('Required permissions for /api/permissions/roles:');
    console.log(`  users.view: ${hasUsersView ? '✓' : '✗'}`);
    console.log(`  users.manage_roles: ${hasUsersManageRoles ? '✓' : '✗'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminPermissions();
