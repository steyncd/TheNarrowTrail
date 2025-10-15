// routes/payments.js - Payment routes
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// All payment routes require authentication
router.use(authenticateToken);

// Get payments for a specific hike (authenticated users can view)
router.get('/hikes/:hikeId/payments', paymentController.getHikePayments);

// Get payment statistics for a hike
router.get('/hikes/:hikeId/payments/stats', paymentController.getHikePaymentStats);

// Payment management routes - require attendance management permission
router.get('/payments', requirePermission('hikes.manage_attendance'), paymentController.getAllPayments);
router.get('/payments/overview', requirePermission('hikes.manage_attendance'), paymentController.getPaymentsOverview);
router.post('/payments', requirePermission('hikes.manage_attendance'), paymentController.recordPayment);
router.delete('/payments/:id', requirePermission('hikes.manage_attendance'), paymentController.deletePayment);
router.post('/hikes/:hikeId/payments/bulk', requirePermission('hikes.manage_attendance'), paymentController.bulkCreatePayments);

module.exports = router;
