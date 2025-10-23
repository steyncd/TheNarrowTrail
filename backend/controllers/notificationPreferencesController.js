// controllers/notificationPreferencesController.js - Notification preferences controller
const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Notification type definitions (must match frontend)
const NOTIFICATION_TYPES = {
  USER_NOTIFICATIONS: [
    'email_verification',
    'account_approved',
    'account_rejected',
    'password_reset_request',
    'password_reset_confirmed',
    'admin_password_reset',
    'admin_promotion',
    'new_hike_added',
    'hike_announcement'
  ],
  ADMIN_NOTIFICATIONS: [
    'new_registration',
    'hike_interest',
    'attendance_confirmed',
    'new_feedback',
    'new_suggestion'
  ],
  CRITICAL_NOTIFICATIONS: [
    'email_verification',
    'password_reset_request',
    'admin_password_reset'
  ]
};

// Get all notification types
exports.getNotificationTypes = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    const types = {
      user: NOTIFICATION_TYPES.USER_NOTIFICATIONS.map(code => ({
        code,
        critical: NOTIFICATION_TYPES.CRITICAL_NOTIFICATIONS.includes(code)
      })),
      admin: isAdmin ? NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS.map(code => ({
        code,
        critical: false,
        adminOnly: true
      })) : []
    };

    res.json(types);
  } catch (error) {
    console.error('Get notification types error:', error);
    res.status(500).json({ error: 'Failed to fetch notification types' });
  }
};

// Get user's notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's global settings
    const userResult = await pool.query(
      'SELECT notifications_email, notifications_whatsapp FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's specific notification preferences
    const preferencesResult = await pool.query(
      'SELECT notification_type, email_enabled, whatsapp_enabled, updated_at FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    // Build preferences object and find most recent update
    const preferences = {};
    let lastUpdated = null;
    preferencesResult.rows.forEach(pref => {
      preferences[pref.notification_type] = {
        email: pref.email_enabled,
        whatsapp: pref.whatsapp_enabled
      };
      // Track the most recent update
      if (!lastUpdated || new Date(pref.updated_at) > new Date(lastUpdated)) {
        lastUpdated = pref.updated_at;
      }
    });

    // Fill in defaults for notification types that don't have explicit preferences
    const isAdmin = req.user.role === 'admin';
    const allTypes = [
      ...NOTIFICATION_TYPES.USER_NOTIFICATIONS,
      ...(isAdmin ? NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS : [])
    ];

    allTypes.forEach(type => {
      if (!preferences[type]) {
        preferences[type] = {
          email: true,
          whatsapp: true
        };
      }
    });

    res.json({
      global: {
        email: user.notifications_email,
        whatsapp: user.notifications_whatsapp
      },
      preferences,
      lastUpdated
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

// Update user's notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { global, preferences } = req.body;

    if (!global || !preferences) {
      return res.status(400).json({ error: 'Global settings and preferences are required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update global settings
      await client.query(
        'UPDATE users SET notifications_email = $1, notifications_whatsapp = $2 WHERE id = $3',
        [global.email, global.whatsapp, userId]
      );

      // Get user's role to validate notification types
      const userResult = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      const isAdmin = userResult.rows[0].role === 'admin';

      // Validate and update individual preferences
      const allowedTypes = [
        ...NOTIFICATION_TYPES.USER_NOTIFICATIONS,
        ...(isAdmin ? NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS : [])
      ];

      for (const [notifType, settings] of Object.entries(preferences)) {
        // Skip if not an allowed type for this user
        if (!allowedTypes.includes(notifType)) {
          continue;
        }

        // Skip critical notifications (they're always enabled)
        if (NOTIFICATION_TYPES.CRITICAL_NOTIFICATIONS.includes(notifType)) {
          continue;
        }

        // Upsert preference
        await client.query(
          `INSERT INTO notification_preferences (user_id, notification_type, email_enabled, whatsapp_enabled, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (user_id, notification_type)
           DO UPDATE SET
             email_enabled = $3,
             whatsapp_enabled = $4,
             updated_at = NOW()`,
          [userId, notifType, settings.email, settings.whatsapp]
        );
      }

      await client.query('COMMIT');

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(
        userId,
        'update_notification_preferences',
        'notification_preferences',
        null,
        JSON.stringify({ global, preferencesCount: Object.keys(preferences).length }),
        ipAddress
      );

      res.json({
        success: true,
        message: 'Notification preferences updated successfully'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Admin: Get another user's notification preferences
exports.getUserPreferences = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const targetUserId = parseInt(req.params.userId);

    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get target user's global settings
    const userResult = await pool.query(
      'SELECT id, name, email, role, notifications_email, notifications_whatsapp FROM users WHERE id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's specific notification preferences
    const preferencesResult = await pool.query(
      'SELECT notification_type, email_enabled, whatsapp_enabled, updated_at FROM notification_preferences WHERE user_id = $1',
      [targetUserId]
    );

    // Build preferences object and find most recent update
    const preferences = {};
    let lastUpdated = null;
    preferencesResult.rows.forEach(pref => {
      preferences[pref.notification_type] = {
        email: pref.email_enabled,
        whatsapp: pref.whatsapp_enabled
      };
      // Track the most recent update
      if (!lastUpdated || new Date(pref.updated_at) > new Date(lastUpdated)) {
        lastUpdated = pref.updated_at;
      }
    });

    // Fill in defaults for notification types that don't have explicit preferences
    const isTargetAdmin = user.role === 'admin';
    const allTypes = [
      ...NOTIFICATION_TYPES.USER_NOTIFICATIONS,
      ...(isTargetAdmin ? NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS : [])
    ];

    allTypes.forEach(type => {
      if (!preferences[type]) {
        preferences[type] = {
          email: true,
          whatsapp: true
        };
      }
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      global: {
        email: user.notifications_email,
        whatsapp: user.notifications_whatsapp
      },
      preferences,
      lastUpdated
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch user notification preferences' });
  }
};

// Admin: Update another user's notification preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const targetUserId = parseInt(req.params.userId);
    const { global, preferences } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!global || !preferences) {
      return res.status(400).json({ error: 'Global settings and preferences are required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify target user exists and get their role
      const userResult = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [targetUserId]
      );

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      const isTargetAdmin = userResult.rows[0].role === 'admin';

      // Update global settings
      await client.query(
        'UPDATE users SET notifications_email = $1, notifications_whatsapp = $2 WHERE id = $3',
        [global.email, global.whatsapp, targetUserId]
      );

      // Validate and update individual preferences
      const allowedTypes = [
        ...NOTIFICATION_TYPES.USER_NOTIFICATIONS,
        ...(isTargetAdmin ? NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS : [])
      ];

      for (const [notifType, settings] of Object.entries(preferences)) {
        // Skip if not an allowed type for this user
        if (!allowedTypes.includes(notifType)) {
          continue;
        }

        // Skip critical notifications (they're always enabled)
        if (NOTIFICATION_TYPES.CRITICAL_NOTIFICATIONS.includes(notifType)) {
          continue;
        }

        // Upsert preference
        await client.query(
          `INSERT INTO notification_preferences (user_id, notification_type, email_enabled, whatsapp_enabled, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (user_id, notification_type)
           DO UPDATE SET
             email_enabled = $3,
             whatsapp_enabled = $4,
             updated_at = NOW()`,
          [targetUserId, notifType, settings.email, settings.whatsapp]
        );
      }

      await client.query('COMMIT');

      // Log activity by admin
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(
        req.user.id,
        'admin_update_user_notification_preferences',
        'notification_preferences',
        targetUserId,
        JSON.stringify({ targetUserId, global, preferencesCount: Object.keys(preferences).length }),
        ipAddress
      );

      res.json({
        success: true,
        message: 'User notification preferences updated successfully'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ error: 'Failed to update user notification preferences' });
  }
};

// Send test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { channel } = req.body; // 'email' or 'whatsapp'

    if (!channel || !['email', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ error: 'Valid channel (email or whatsapp) is required' });
    }

    // Get user info
    const userResult = await pool.query(
      'SELECT name, email, phone FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Import notification service
    const notificationService = require('../services/notificationService');

    if (channel === 'email') {
      if (!user.email) {
        return res.status(400).json({ error: 'No email address on file' });
      }

      const subject = 'Test Notification - The Narrow Trail';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Notification</h2>
          <p>Hi ${user.name},</p>
          <p>This is a test notification to verify your notification settings are working correctly.</p>
          <p>If you received this email, your email notifications are configured properly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is a test message from The Narrow Trail notification system.
          </p>
        </div>
      `;

      await notificationService.sendEmail(user.email, subject, html);

      return res.json({
        success: true,
        message: `Test email sent to ${user.email}`
      });
    } else if (channel === 'whatsapp') {
      if (!user.phone) {
        return res.status(400).json({ error: 'No phone number on file' });
      }

      const message = `Hi ${user.name}, this is a test notification from The Narrow Trail. If you received this message, your SMS notifications are working correctly!`;

      await notificationService.sendWhatsApp(user.phone, message);

      return res.json({
        success: true,
        message: `Test SMS sent to ${user.phone}`
      });
    }
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      error: 'Failed to send test notification',
      details: error.message
    });
  }
};

// Check if a specific notification should be sent to a user
exports.shouldSendNotification = async (userId, notificationType, channel) => {
  try {
    // Critical notifications are always sent via email
    if (NOTIFICATION_TYPES.CRITICAL_NOTIFICATIONS.includes(notificationType) && channel === 'email') {
      return true;
    }

    // Get user's global settings
    const userResult = await pool.query(
      'SELECT notifications_email, notifications_whatsapp FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return false;
    }

    const user = userResult.rows[0];

    // Check global setting for channel
    if (channel === 'email' && !user.notifications_email) {
      return false;
    }
    if (channel === 'whatsapp' && !user.notifications_whatsapp) {
      return false;
    }

    // Check specific preference
    const prefResult = await pool.query(
      'SELECT email_enabled, whatsapp_enabled FROM notification_preferences WHERE user_id = $1 AND notification_type = $2',
      [userId, notificationType]
    );

    // If no specific preference, default to enabled
    if (prefResult.rows.length === 0) {
      return true;
    }

    const pref = prefResult.rows[0];

    if (channel === 'email') {
      return pref.email_enabled;
    }
    if (channel === 'whatsapp') {
      return pref.whatsapp_enabled;
    }

    return false;
  } catch (error) {
    console.error('Should send notification check error:', error);
    // Default to true on error to avoid missing critical notifications
    return true;
  }
};

module.exports = exports;
