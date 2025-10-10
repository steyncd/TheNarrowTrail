// routes/admin.js - Admin routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Setup endpoint doesn't require authentication
router.post('/setup-admin', async (req, res) => {
  try {
    const { email, password, setupKey } = req.body;
    
    // Simple setup key check (you can change this)
    if (setupKey !== 'setup-retention-2025') {
      return res.status(403).json({ error: 'Invalid setup key' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const client = await pool.connect();
    try {
      // Create or update admin user  
      const result = await client.query(`
        INSERT INTO users (
          email, name, password, phone, role, status, email_verified,
          privacy_consent_accepted, privacy_consent_date,
          terms_accepted, terms_accepted_date,
          data_processing_consent, data_processing_consent_date,
          created_at
        )
        VALUES ($1, $2, $3, '', 'admin', 'approved', true, true, NOW(), true, NOW(), true, NOW(), NOW())
        ON CONFLICT (email) 
        DO UPDATE SET 
          password = $3, 
          role = 'admin', 
          status = 'approved', 
          email_verified = true
        RETURNING id, email, role
      `, [email, 'Admin User', hashedPassword]);
      
      res.json({ 
        success: true, 
        message: 'Admin user created/updated',
        user: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// All other admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// User management routes
// GET /api/admin/pending-users - Get all pending users
router.get('/pending-users', adminController.getPendingUsers);

// GET /api/admin/users - Get all approved users
router.get('/users', adminController.getUsers);

// PUT /api/admin/users/:id/approve - Approve user
router.put('/users/:id/approve', adminController.approveUser);

// DELETE /api/admin/reject-user/:id - Reject user (legacy route)
router.delete('/reject-user/:id', adminController.rejectUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminController.deleteUser);

// POST /api/admin/users - Create user
router.post('/users', adminController.createUser);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', adminController.updateUser);

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// PUT /api/admin/users/:id/promote - Promote user to admin
router.put('/users/:id/promote', adminController.promoteUser);

// Notification routes
// GET /api/admin/notifications - Get notification log
router.get('/notifications', adminController.getNotifications);

// POST /api/admin/test-notification - Test notification
router.post('/test-notification', adminController.testNotification);

// POPIA Compliance routes
// GET /api/admin/consent-status - Get consent status for all users
router.get('/consent-status', adminController.getConsentStatus);

// Data Retention routes (POPIA compliance)
// GET /api/admin/retention/statistics - Get retention statistics
router.get('/retention/statistics', adminController.getRetentionStatistics);

// POST /api/admin/retention/run-check - Manual retention check
router.post('/retention/run-check', adminController.runRetentionCheck);

// POST /api/admin/retention/extend/:userId - Extend retention for user
router.post('/retention/extend/:userId', adminController.extendUserRetention);

// GET /api/admin/retention/logs - Get retention audit logs
router.get('/retention/logs', adminController.getRetentionLogs);

// POST /api/admin/retention/service - Start/stop retention service
router.post('/retention/service', adminController.toggleRetentionService);

// Migration routes
// POST /api/admin/run-migration/:filename - Run database migration
router.post('/run-migration/:filename', async (req, res) => {
  try {
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
