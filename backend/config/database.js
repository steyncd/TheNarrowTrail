// config/database.js - Database configuration and connection pool
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hiking_portal'
};

// Handle Cloud SQL socket connection (for Cloud Run)
if (isProduction && process.env.DB_HOST && process.env.DB_HOST.startsWith('/cloudsql/')) {
  // Unix socket connection for Cloud SQL
  dbConfig.host = process.env.DB_HOST;
  console.log('Using Cloud SQL socket connection:', dbConfig.host);
} else {
  // TCP connection for local development or other environments
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = parseInt(process.env.DB_PORT) || 5432;
  console.log('Using TCP connection:', dbConfig.host, ':', dbConfig.port);
}

const pool = new Pool(dbConfig);

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    console.error('Connection config:', {
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      port: dbConfig.port
    });
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
  }
});

module.exports = pool;
