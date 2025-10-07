const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// User routes
router.post('/', authenticateToken, suggestionController.submitSuggestion);

// Admin routes
router.get('/', authenticateToken, requireAdmin, suggestionController.getAllSuggestions);
router.get('/stats', authenticateToken, requireAdmin, suggestionController.getSuggestionStats);
router.put('/:id', authenticateToken, requireAdmin, suggestionController.updateSuggestionStatus);
router.delete('/:id', authenticateToken, requireAdmin, suggestionController.deleteSuggestion);

module.exports = router;
