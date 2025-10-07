// routes/interest.js - Interest routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const interestController = require('../controllers/interestController');

// All interest routes require authentication
router.use(authenticateToken);

// POST /api/hikes/:id/interest - Toggle interest in hike
router.post('/:id/interest', interestController.toggleInterest);

module.exports = router;
