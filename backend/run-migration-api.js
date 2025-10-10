// run-migration-api.js - Script to run migrations via API
const axios = require('axios');

const API_BASE = 'https://backend-554106646136.europe-west1.run.app/api';

// You'll need to replace this with your actual admin email/password
const ADMIN_EMAIL = 'admin@example.com'; // Replace with your admin email
const ADMIN_PASSWORD = 'your-password'; // Replace with your admin password

async function runMigration(migrationFile) {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login to get token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Run migration
    console.log(`🚀 Running migration: ${migrationFile}`);
    const migrationResponse = await axios.post(
      `${API_BASE}/admin/run-migration/${migrationFile}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Migration completed:', migrationResponse.data.message);
    return migrationResponse.data;

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
    throw error;
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.log('Usage: node run-migration-api.js <migration-file>');
  console.log('Example: node run-migration-api.js 016_add_data_retention_tracking.sql');
  process.exit(1);
}

runMigration(migrationFile)
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });