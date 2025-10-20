// debug-db.js - Database connection test
require('dotenv').config({ path: '.env' });

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD, 'Type:', typeof process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hiking_portal',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'hiking_password')
};

console.log('\nDatabase config:');
console.log({
  ...dbConfig,
  password: '***HIDDEN***'
});

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('\n✅ Database connection successful!');
    console.log('Connected to:', result.rows[0].database_name);
    console.log('Current time:', result.rows[0].current_time);
    client.release();
    await pool.end();
  } catch (err) {
    console.error('\n❌ Database connection failed:');
    console.error('Error:', err.message);
    await pool.end();
  }
}

testConnection();