// routes/feedback.js - Feedback routes
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// Submit feedback (authenticated users)
router.post('/', authenticateToken, feedbackController.submitFeedback);

// Get all feedback (requires feedback.view permission)
router.get('/', authenticateToken, requirePermission('feedback.view'), feedbackController.getAllFeedback);

// Get feedback statistics (requires feedback.view permission)
router.get('/stats', authenticateToken, requirePermission('feedback.view'), feedbackController.getFeedbackStats);

// Update feedback status (requires feedback.respond permission)
router.put('/:id', authenticateToken, requirePermission('feedback.respond'), feedbackController.updateFeedbackStatus);

// Delete feedback (requires feedback.delete permission)
router.delete('/:id', authenticateToken, requirePermission('feedback.delete'), feedbackController.deleteFeedback);

module.exports = router;
