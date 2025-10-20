// routes/admin.js - Admin routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../middleware/permissions');
const adminController = require('../controllers/adminController');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/branding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, SVG, ICO)'));
    }
  }
});

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

// User management routes - require appropriate permissions
// GET /api/admin/pending-users - Get all pending users
router.get('/pending-users', authenticateToken, requirePermission('users.approve'), adminController.getPendingUsers);

// GET /api/admin/users - Get all approved users
router.get('/users', authenticateToken, requirePermission('users.view'), adminController.getUsers);

// PUT /api/admin/users/:id/approve - Approve user
router.put('/users/:id/approve', authenticateToken, requirePermission('users.approve'), adminController.approveUser);

// DELETE /api/admin/reject-user/:id - Reject user (legacy route)
router.delete('/reject-user/:id', authenticateToken, requirePermission('users.approve'), adminController.rejectUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateToken, requirePermission('users.delete'), adminController.deleteUser);

// POST /api/admin/users - Create user
router.post('/users', authenticateToken, requirePermission('users.create'), adminController.createUser);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', authenticateToken, requirePermission('users.edit'), adminController.updateUser);

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', authenticateToken, requirePermission('users.reset_password'), adminController.resetUserPassword);

// PUT /api/admin/users/:id/promote - Promote user to admin
router.put('/users/:id/promote', authenticateToken, requirePermission('users.promote'), adminController.promoteUser);

// Notification routes
// GET /api/admin/notifications - Get notification log
router.get('/notifications', authenticateToken, requirePermission('notifications.view'), adminController.getNotifications);

// POST /api/admin/test-notification - Test notification
router.post('/test-notification', authenticateToken, requirePermission('notifications.test'), adminController.testNotification);

// POPIA Compliance routes
// GET /api/admin/consent-status - Get consent status for all users
router.get('/consent-status', authenticateToken, requirePermission('compliance.view'), adminController.getConsentStatus);

// Data Retention routes (POPIA compliance)
// GET /api/admin/retention/statistics - Get retention statistics
router.get('/retention/statistics', authenticateToken, requirePermission('compliance.view'), adminController.getRetentionStatistics);

// POST /api/admin/retention/run-check - Manual retention check
router.post('/retention/run-check', authenticateToken, requirePermission('compliance.manage'), adminController.runRetentionCheck);

// POST /api/admin/retention/extend/:userId - Extend retention for user
router.post('/retention/extend/:userId', authenticateToken, requirePermission('compliance.manage'), adminController.extendUserRetention);

// GET /api/admin/retention/logs - Get retention audit logs
router.get('/retention/logs', authenticateToken, requirePermission('audit.view'), adminController.getRetentionLogs);

// POST /api/admin/retention/service - Start/stop retention service
router.post('/retention/service', authenticateToken, requirePermission('settings.manage'), adminController.toggleRetentionService);

// Weather cache management
// POST /api/admin/clear-weather-cache - Clear weather cache
router.post('/clear-weather-cache', authenticateToken, requirePermission('settings.edit'), async (req, res) => {
  try {
    const { clearWeatherCache } = require('../services/weatherService');
    clearWeatherCache();

    res.json({
      success: true,
      message: 'Weather cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear weather cache error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Migration routes - require settings management permission
// POST /api/admin/run-migration/:filename - Run database migration
router.post('/run-migration/:filename', authenticateToken, requirePermission('settings.manage'), async (req, res) => {
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

// Logo upload endpoint
// POST /api/admin/upload-logo - Upload portal logo
router.post('/upload-logo', authenticateToken, requirePermission('settings.edit'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct URL for the uploaded file
    const fileUrl = `/uploads/branding/${req.file.filename}`;

    // Update setting in database
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, category, is_public)
        VALUES ('branding_logo_url', $1, 'string', 'branding', true)
        ON CONFLICT (setting_key)
        DO UPDATE SET setting_value = $1, updated_at = NOW()
      `, [fileUrl]);

      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        message: 'Logo uploaded successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Favicon upload endpoint
// POST /api/admin/upload-favicon - Upload favicon
router.post('/upload-favicon', authenticateToken, requirePermission('settings.edit'), upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct URL for the uploaded file
    const fileUrl = `/uploads/branding/${req.file.filename}`;

    // Update setting in database
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, category, is_public)
        VALUES ('branding_favicon_url', $1, 'string', 'branding', true)
        ON CONFLICT (setting_key)
        DO UPDATE SET setting_value = $1, updated_at = NOW()
      `, [fileUrl]);

      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        message: 'Favicon uploaded successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Favicon upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
