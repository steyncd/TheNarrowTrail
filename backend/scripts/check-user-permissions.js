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
    // List all permissions for User ID 1
    const result = await client.query(`
      SELECT permission_name
      FROM user_permissions_view
      WHERE user_id = 1
      ORDER BY permission_name
    `);

    console.log('Permissions for User ID 1:');
    result.rows.forEach(row => {
      console.log(`  - ${row.permission_name}`);
    });

    // Check if users.manage exists in the system
    console.log('\nChecking if users.manage permission exists:');
    const permCheck = await client.query(`
      SELECT * FROM permissions WHERE name = 'users.manage'
    `);

    if (permCheck.rows.length > 0) {
      console.log('✅ users.manage permission exists in permissions table');
    } else {
      console.log('❌ users.manage permission does NOT exist!');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkPermissions().catch(console.error);
