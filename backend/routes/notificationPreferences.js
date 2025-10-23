// routes/notificationPreferences.js - Notification preferences routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationPreferencesController = require('../controllers/notificationPreferencesController');

// Get all notification types
router.get('/types', authenticateToken, notificationPreferencesController.getNotificationTypes);

// Get user's notification preferences
router.get('/', authenticateToken, notificationPreferencesController.getPreferences);

// Update user's notification preferences
router.put('/', authenticateToken, notificationPreferencesController.updatePreferences);

// Send test notification
router.post('/test', authenticateToken, notificationPreferencesController.sendTestNotification);

// Admin: Get another user's notification preferences
router.get('/user/:userId', authenticateToken, notificationPreferencesController.getUserPreferences);

// Admin: Update another user's notification preferences
router.put('/user/:userId', authenticateToken, notificationPreferencesController.updateUserPreferences);

module.exports = router;
