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

// POPIA: Export user data (Right to Data Portability)
router.get('/export/data', authenticateToken, profileController.exportUserData);

// POPIA: Delete account (Right to Deletion)
router.delete('/delete/account', authenticateToken, profileController.deleteAccount);

module.exports = router;
