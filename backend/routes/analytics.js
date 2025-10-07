// routes/analytics.js - Analytics Dashboard Routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(authenticateToken);
router.use(requireAdmin);

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
