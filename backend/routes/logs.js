// routes/logs.js - Logs routes (Admin only)
const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All logs routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/logs/signin - Get signin logs
router.get('/signin', logsController.getSigninLogs);

// GET /api/logs/activity - Get activity logs
router.get('/activity', logsController.getActivityLogs);

// GET /api/logs/stats - Get activity statistics
router.get('/stats', logsController.getActivityStats);

module.exports = router;
