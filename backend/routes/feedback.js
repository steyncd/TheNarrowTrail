// routes/feedback.js - Feedback routes
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Submit feedback (authenticated users)
router.post('/', authenticateToken, feedbackController.submitFeedback);

// Get all feedback (admin only)
router.get('/', authenticateToken, requireAdmin, feedbackController.getAllFeedback);

// Get feedback statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, feedbackController.getFeedbackStats);

// Update feedback status (admin only)
router.put('/:id', authenticateToken, requireAdmin, feedbackController.updateFeedbackStatus);

// Delete feedback (admin only)
router.delete('/:id', authenticateToken, requireAdmin, feedbackController.deleteFeedback);

module.exports = router;
