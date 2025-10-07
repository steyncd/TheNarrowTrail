// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// GET /api/auth/verify-email/:token - Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/verify-reset-token - Verify reset token
router.post('/verify-reset-token', authController.verifyResetToken);

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', authController.resetPassword);

// POST /api/auth/login - Login
router.post('/login', authController.login);

module.exports = router;
