const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// User routes
router.post('/', authenticateToken, suggestionController.submitSuggestion);

// Admin routes - now permission-based
router.get('/', authenticateToken, requirePermission('feedback.view'), suggestionController.getAllSuggestions);
router.get('/stats', authenticateToken, requirePermission('feedback.view'), suggestionController.getSuggestionStats);
router.put('/:id', authenticateToken, requirePermission('feedback.respond'), suggestionController.updateSuggestionStatus);
router.delete('/:id', authenticateToken, requirePermission('feedback.delete'), suggestionController.deleteSuggestion);

module.exports = router;
