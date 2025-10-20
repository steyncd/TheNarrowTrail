// routes/settings.js - System settings routes
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requireAdmin: authRequireAdmin } = require('../middleware/auth');

// Public branding settings endpoint (NO AUTH REQUIRED) - MUST be before router.use(authenticateToken)
router.get('/public/branding', settingsController.getPublicBrandingSettings);

// All other settings routes require authentication and admin role
router.use(authenticateToken);

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all settings
router.get('/', requireAdmin, settingsController.getAllSettings);

// Get settings by category
router.get('/category/:category', requireAdmin, settingsController.getSettingsByCategory);

// Get single setting by key
router.get('/:key', requireAdmin, settingsController.getSettingByKey);

// Update single setting
router.put('/', requireAdmin, settingsController.updateSetting);

// Update multiple settings
router.put('/batch', requireAdmin, settingsController.updateMultipleSettings);

// Weather provider specific routes
router.get('/weather/providers', requireAdmin, settingsController.getWeatherProviders);
router.post('/weather/test', requireAdmin, settingsController.testWeatherProvider);

module.exports = router;
