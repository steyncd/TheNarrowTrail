// Check admin permissions after migration
const { Pool } = require('pg');

const pool = new Pool({
  host: '35.202.149.98',
  port: 5432,
  database: 'hiking_portal',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: false
});

async function checkPermissions() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking admin permissions...\n');

    // Check admins and their permissions
    const result = await client.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role as users_table_role,
        r.name as assigned_role,
        (SELECT COUNT(*) FROM user_permissions_view WHERE user_id = u.id) as permission_count
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.role = 'admin'
      ORDER BY u.id
    `);

    console.log('Admin Users:');
    console.log('════════════');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Role (users table): ${row.users_table_role}`);
      console.log(`  Assigned Role: ${row.assigned_role}`);
      console.log(`  Permissions: ${row.permission_count}`);
      console.log('');
    });

    // Check specific permission for User ID 1
    const permResult = await client.query(`
      SELECT permission_name
      FROM user_permissions_view
      WHERE user_id = 1 AND permission_name = 'users.manage'
    `);

    if (permResult.rows.length > 0) {
      console.log('✅ User ID 1 has users.manage permission');
    } else {
      console.log('❌ User ID 1 does NOT have users.manage permission');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkPermissions().catch(console.error);
