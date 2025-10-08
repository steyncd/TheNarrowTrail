// routes/payments.js - Payment routes
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateToken);

// Get payments for a specific hike (authenticated users can view)
router.get('/hikes/:hikeId/payments', paymentController.getHikePayments);

// Get payment statistics for a hike
router.get('/hikes/:hikeId/payments/stats', paymentController.getHikePaymentStats);

// Admin-only routes
router.get('/payments', requireAdmin, paymentController.getAllPayments);
router.post('/payments', requireAdmin, paymentController.recordPayment);
router.delete('/payments/:id', requireAdmin, paymentController.deletePayment);
router.post('/hikes/:hikeId/payments/bulk', requireAdmin, paymentController.bulkCreatePayments);

module.exports = router;
