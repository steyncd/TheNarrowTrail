// routes/tokens.js - Long-lived token routes
const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// POST /api/tokens/generate - Generate new long-lived token
router.post('/generate', tokenController.generateLongLivedToken);

// GET /api/tokens - List all user's tokens
router.get('/', tokenController.listTokens);

// DELETE /api/tokens/:id - Revoke a token
router.delete('/:id', tokenController.revokeToken);

module.exports = router;
