// routes/analytics.js - Analytics Dashboard Routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const analyticsController = require('../controllers/analyticsController');

// Public statistics endpoint (NO AUTH REQUIRED) - MUST be before authentication middleware
router.get('/public/statistics', analyticsController.getPublicStatistics);

// All other analytics routes require analytics.view permission
router.use(authenticateToken);
router.use(requirePermission('analytics.view'));

// Get analytics overview
router.get('/overview', analyticsController.getOverview);

// Get user analytics
router.get('/users', analyticsController.getUserAnalytics);

// Get hike analytics
router.get('/hikes', analyticsController.getHikeAnalytics);

// Get engagement metrics
router.get('/engagement', analyticsController.getEngagementMetrics);

// Clear analytics cache
router.post('/clear-cache', analyticsController.clearCache);

module.exports = router;
