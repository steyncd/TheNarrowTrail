const { Client } = require('pg');

const client = new Client({
  host: '35.202.149.98',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '!Dobby1021',
  ssl: { rejectUnauthorized: false }
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Creating hiking-db database...');
    await client.query('CREATE DATABASE "hiking-db"');
    console.log('✓ Database hiking-db created successfully!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database hiking-db already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
