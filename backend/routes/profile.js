// routes/profile.js - Profile Management Routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Get user profile (public, but respects privacy settings)
router.get('/:userId', authenticateToken, profileController.getUserProfile);

// Get user statistics
router.get('/:userId/stats', authenticateToken, profileController.getUserStats);

// Update own profile
router.put('/', authenticateToken, profileController.updateProfile);

module.exports = router;
