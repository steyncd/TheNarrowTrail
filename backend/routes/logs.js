// routes/logs.js - Activity and signin logs routes
const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// All logs routes require authentication and audit.view permission
router.use(authenticateToken);
router.use(requirePermission('audit.view'));

// GET /api/logs/signin - Get signin logs
router.get('/signin', logsController.getSigninLogs);

// GET /api/logs/activity - Get activity logs
router.get('/activity', logsController.getActivityLogs);

// GET /api/logs/stats - Get activity statistics
router.get('/stats', logsController.getActivityStats);

module.exports = router;
