// routes/admin.js - Add migration endpoint
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// ... existing routes ...

// Migration endpoint (admin only)
router.post('/run-migration/:filename', async (req, res) => {
  try {
    // Security check - only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const filename = req.params.filename;
    const migrationPath = path.join(__dirname, '..', 'migrations', filename);
    
    // Verify file exists and is a .sql file
    if (!filename.endsWith('.sql') || !fs.existsSync(migrationPath)) {
      return res.status(400).json({ error: 'Invalid migration file' });
    }

    // Read and execute migration
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migrationSQL);
      await client.query('COMMIT');
      
      console.log(`✅ Migration ${filename} executed successfully`);
      res.json({ 
        success: true, 
        message: `Migration ${filename} executed successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration ${filename} failed:`, error);
      res.status(500).json({ 
        error: `Migration failed: ${error.message}`,
        migration: filename
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;