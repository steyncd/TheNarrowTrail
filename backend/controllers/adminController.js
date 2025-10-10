// controllers/adminController.js - Admin controller
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');
const { logActivity } = require('../utils/activityLogger');
const emailTemplates = require('../services/emailTemplates');

// Get all pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE status = $1 ORDER BY created_at DESC',
      ['pending']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
};

// Get all approved users
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, notifications_email, notifications_whatsapp, created_at FROM users WHERE status = $1 ORDER BY name',
      ['approved']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Update user status
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Send approval notification
    if (user.notifications_email) {
      await sendEmail(
        user.email,
        'Welcome to The Narrow Trail',
        emailTemplates.welcomeEmail(user.name)
      );
    }

    if (user.notifications_whatsapp) {
      await sendWhatsApp(
        user.phone,
        `Welcome ${user.name}! Your hiking group registration has been approved. You can now log in.`
      );
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'approve_user', 'user', id, JSON.stringify({ user_name: user.name, user_email: user.email }), ipAddress);

    res.json({ message: 'User approved', user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user info before deleting
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = userResult.rows[0];

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    // Send rejection notification
    if (user && user.notifications_email) {
      await sendEmail(
        user.email,
        'Registration Update',
        emailTemplates.rejectionEmail(user.name)
      );
    }

    res.json({ message: 'User rejected' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, status, notifications_email, notifications_whatsapp, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, true, NOW())
       RETURNING id, name, email, phone, role, status, created_at`,
      [name, email, hashedPassword, phone, role || 'hiker', status || 'approved']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, notifications_email, notifications_whatsapp } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Check if email is taken by another user
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use by another user' });
    }

    // Update user
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, phone = $3, role = $4,
           notifications_email = $5, notifications_whatsapp = $6
       WHERE id = $7
       RETURNING id, name, email, phone, role, status, notifications_email, notifications_whatsapp, created_at`,
      [name, email, phone, role, notifications_email, notifications_whatsapp, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Get user info
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    // Send notification email
    await sendEmail(
      user.email,
      'Password Reset by Administrator',
      emailTemplates.adminPasswordResetEmail(user.name, newPassword)
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
};

// Promote user to admin
exports.promoteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Update user role to admin
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, status, notifications_email, notifications_whatsapp, created_at',
      ['admin', id]
    );

    // Send notification email
    await sendEmail(
      user.email,
      'Admin Access Granted',
      emailTemplates.adminPromotionEmail(user.name)
    );

    res.json({
      message: 'User promoted to admin successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({ error: 'Failed to promote user', details: error.message });
  }
};

// Get notification log
exports.getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_log ORDER BY sent_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Test notification
exports.testNotification = async (req, res) => {
  try {
    const { type, recipient, subject, message } = req.body;

    if (!type || !recipient || !message) {
      return res.status(400).json({ error: 'Type, recipient, and message are required' });
    }

    let success = false;
    let error = null;

    if (type === 'email') {
      if (!subject) {
        return res.status(400).json({ error: 'Subject is required for email' });
      }
      success = await sendEmail(recipient, subject, message);
      error = success ? null : 'Email service not configured or failed';
    } else if (type === 'whatsapp') {
      success = await sendWhatsApp(recipient, message);
      error = success ? null : 'WhatsApp service not configured or failed';
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    res.json({
      success,
      message: success ? 'Test notification sent successfully' : 'Test notification failed',
      error
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification', details: error.message });
  }
};

// Get POPIA consent status for all users (Admin only)
exports.getConsentStatus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, name, email, phone, status, role,
        privacy_consent_accepted, privacy_consent_date,
        terms_accepted, terms_accepted_date,
        data_processing_consent, data_processing_consent_date,
        created_at
      FROM users 
      WHERE status = 'approved'
      ORDER BY created_at DESC`
    );

    const stats = {
      total_users: result.rows.length,
      all_consents: result.rows.filter(u => 
        u.privacy_consent_accepted && u.terms_accepted && u.data_processing_consent
      ).length,
      missing_privacy: result.rows.filter(u => !u.privacy_consent_accepted).length,
      missing_terms: result.rows.filter(u => !u.terms_accepted).length,
      missing_data_processing: result.rows.filter(u => !u.data_processing_consent).length
    };

    res.json({
      users: result.rows,
      stats
    });
  } catch (error) {
    console.error('Get consent status error:', error);
    res.status(500).json({ error: 'Failed to fetch consent status' });
  }
};

// Data Retention Management Functions
const dataRetentionService = require('../services/dataRetentionService');

// Get retention statistics for admin dashboard
exports.getRetentionStatistics = async (req, res) => {
  try {
    const stats = await dataRetentionService.getRetentionStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get retention statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch retention statistics' });
  }
};

// Manual run of retention processes (for testing/admin)
exports.runRetentionCheck = async (req, res) => {
  try {
    const stats = await dataRetentionService.runManualCheck();
    res.json({
      success: true,
      message: 'Retention check completed',
      statistics: stats
    });
  } catch (error) {
    console.error('Manual retention check error:', error);
    res.status(500).json({ error: 'Failed to run retention check' });
  }
};

// Extend retention for specific user (admin override)
exports.extendUserRetention = async (req, res) => {
  try {
    const { userId } = req.params;
    const { extensionDays, reason } = req.body;

    if (!extensionDays || !reason) {
      return res.status(400).json({ 
        error: 'Extension days and reason are required' 
      });
    }

    await dataRetentionService.extendUserRetention(
      userId, 
      extensionDays, 
      reason, 
      req.user.id
    );

    res.json({
      success: true,
      message: `Retention extended for user ${userId} by ${extensionDays} days`
    });
  } catch (error) {
    console.error('Extend user retention error:', error);
    res.status(500).json({ error: 'Failed to extend user retention' });
  }
};

// Get retention logs for audit trail
exports.getRetentionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [limit, offset];
    let paramCount = 2;

    if (userId) {
      whereClause += `WHERE user_id = $${++paramCount}`;
      params.push(userId);
    }

    if (action) {
      whereClause += whereClause ? ` AND action = $${++paramCount}` : `WHERE action = $${++paramCount}`;
      params.push(action);
    }

    const result = await pool.query(`
      SELECT 
        drl.id,
        drl.user_id,
        drl.action,
        drl.reason,
        drl.metadata,
        drl.performed_by,
        drl.created_at,
        u.email as user_email,
        u.name as user_name
      FROM data_retention_logs drl
      LEFT JOIN users u ON drl.user_id = u.id
      ${whereClause}
      ORDER BY drl.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);

    // Get total count for pagination
    const countParams = params.slice(2); // Remove limit and offset
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM data_retention_logs drl
      ${whereClause}
    `, countParams);

    res.json({
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get retention logs error:', error);
    res.status(500).json({ error: 'Failed to fetch retention logs' });
  }
};

// Start/stop retention service
exports.toggleRetentionService = async (req, res) => {
  try {
    const { action } = req.body; // 'start' or 'stop'

    if (action === 'start') {
      dataRetentionService.start();
      res.json({ success: true, message: 'Data retention service started' });
    } else if (action === 'stop') {
      dataRetentionService.stop();
      res.json({ success: true, message: 'Data retention service stopped' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "start" or "stop"' });
    }
  } catch (error) {
    console.error('Toggle retention service error:', error);
    res.status(500).json({ error: 'Failed to toggle retention service' });
  }
};

