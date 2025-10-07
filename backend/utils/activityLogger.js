// utils/activityLogger.js - Utility for logging user activities
const pool = require('../config/database');

/**
 * Log user activity
 * @param {number} userId - User ID
 * @param {string} action - Action performed (e.g., 'create_hike', 'update_user', 'delete_comment')
 * @param {string} entityType - Type of entity (e.g., 'hike', 'user', 'comment')
 * @param {number} entityId - ID of the entity
 * @param {string} details - Additional details (JSON string or plain text)
 * @param {string} ipAddress - IP address of the user
 */
async function logActivity(userId, action, entityType = null, entityId = null, details = null, ipAddress = null) {
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, action, entityType, entityId, details, ipAddress]
    );
  } catch (error) {
    console.error('Activity logging error:', error);
    // Don't throw - logging should not break the main flow
  }
}

/**
 * Middleware to log activity from request
 */
function activityLoggerMiddleware(action, entityType = null) {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;

    // Override the send function to log after successful response
    res.send = function(data) {
      // Only log if response was successful (2xx status code)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        const entityId = req.params.id || req.body.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (userId) {
          logActivity(userId, action, entityType, entityId, null, ipAddress);
        }
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}

module.exports = {
  logActivity,
  activityLoggerMiddleware
};
