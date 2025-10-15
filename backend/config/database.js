// config/database.js - Database configuration and connection pool
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================================================
// DATABASE CONNECTION CONFIGURATION
// ============================================================================

function createDatabaseConfig() {
  let dbConfig;
  let connectionMethod;

  // Priority 1: DATABASE_URL (preferred for Docker/Heroku/Cloud deployments)
  if (process.env.DATABASE_URL) {
    dbConfig = {
      connectionString: process.env.DATABASE_URL
    };
    connectionMethod = 'DATABASE_URL';
    
    // Add SSL config for production
    if (isProduction) {
      dbConfig.ssl = {
        rejectUnauthorized: false // Required for Cloud SQL
      };
    }
  } 
  // Priority 2: Individual environment variables
  else {
    dbConfig = {
      user: process.env.DB_USER || (isDevelopment ? 'hiking_user' : 'postgres'),
      password: String(process.env.DB_PASSWORD || ''),
      database: process.env.DB_NAME || (isDevelopment ? 'hiking_portal_dev' : 'hiking_portal'),
      port: parseInt(process.env.DB_PORT) || 5432
    };

    // Handle different connection types
    if (isProduction && process.env.DB_HOST && process.env.DB_HOST.startsWith('/cloudsql/')) {
      // Google Cloud SQL Unix socket connection (recommended for Cloud Run)
      dbConfig.host = process.env.DB_HOST;
      connectionMethod = 'Cloud SQL Socket';
    } else {
      // TCP connection (local development or external databases)
      dbConfig.host = process.env.DB_HOST || (isDevelopment ? 'hiking_postgres' : 'localhost');
      connectionMethod = 'TCP';
      
      // Add SSL for production TCP connections
      if (isProduction) {
        dbConfig.ssl = {
          rejectUnauthorized: false
        };
      }
    }
  }

  return { dbConfig, connectionMethod };
}

const { dbConfig, connectionMethod } = createDatabaseConfig();

// ============================================================================
// CONNECTION POOL SETUP
// ============================================================================

const pool = new Pool(dbConfig);

// Connection pool event handlers
pool.on('connect', (client) => {
  if (isDevelopment) {
    console.log('🔗 New database client connected');
  }
});

pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle database client:', err);
});

// ============================================================================
// CONNECTION TESTING & LOGGING
// ============================================================================

async function testConnection() {
  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database_name');
    const duration = Date.now() - startTime;
    
    const connectionInfo = {
      method: connectionMethod,
      database: result.rows[0].database_name,
      connected_at: result.rows[0].current_time,
      response_time: `${duration}ms`,
      environment: process.env.NODE_ENV
    };
    
    if (isDevelopment) {
      console.log('✅ Database connected successfully:');
      console.table(connectionInfo);
    } else {
      console.log('✅ Database connected:', connectionInfo);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error('Connection method:', connectionMethod);
    console.error('Error:', err.message);
    
    // Log config details (without sensitive info) for debugging
    const debugConfig = {
      host: dbConfig.host || 'from DATABASE_URL',
      database: dbConfig.database || 'from DATABASE_URL',
      user: dbConfig.user || 'from DATABASE_URL',
      port: dbConfig.port || 'from DATABASE_URL',
      ssl: !!dbConfig.ssl
    };
    console.error('Config (sanitized):', debugConfig);
    
    return false;
  }
}

// Test connection on startup
testConnection();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, gracefully closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, gracefully closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = pool;
