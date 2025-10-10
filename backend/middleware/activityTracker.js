// middleware/activityTracker.js - Middleware to track user activity for POPIA retention
const dataRetentionService = require('../services/dataRetentionService');

/**
 * Middleware to track user activity for POPIA data retention compliance
 * Updates the last_active_at timestamp when authenticated users make API calls
 */
const trackUserActivity = async (req, res, next) => {
  // Continue with the request first
  next();

  // Asynchronously update activity in the background (non-blocking)
  if (req.user && req.user.id) {
    try {
      // Don't block the response - update activity in background
      setImmediate(async () => {
        await dataRetentionService.updateUserActivity(req.user.id);
      });
    } catch (error) {
      // Log error but don't affect the request
      console.error('Failed to track user activity:', error);
    }
  }
};

module.exports = { trackUserActivity };