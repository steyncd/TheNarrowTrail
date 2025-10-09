// routes/admin.js - Admin routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// User management routes
// GET /api/admin/pending-users - Get all pending users
router.get('/pending-users', adminController.getPendingUsers);

// GET /api/admin/users - Get all approved users
router.get('/users', adminController.getUsers);

// PUT /api/admin/users/:id/approve - Approve user
router.put('/users/:id/approve', adminController.approveUser);

// DELETE /api/admin/reject-user/:id - Reject user (legacy route)
router.delete('/reject-user/:id', adminController.rejectUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminController.deleteUser);

// POST /api/admin/users - Create user
router.post('/users', adminController.createUser);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', adminController.updateUser);

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// PUT /api/admin/users/:id/promote - Promote user to admin
router.put('/users/:id/promote', adminController.promoteUser);

// Notification routes
// GET /api/admin/notifications - Get notification log
router.get('/notifications', adminController.getNotifications);

// POST /api/admin/test-notification - Test notification
router.post('/test-notification', adminController.testNotification);

// POPIA Compliance routes
// GET /api/admin/consent-status - Get consent status for all users
router.get('/consent-status', adminController.getConsentStatus);

module.exports = router;
