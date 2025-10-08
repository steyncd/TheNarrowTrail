// routes/interest.js - Interest and Attendance routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const interestController = require('../controllers/interestController');

// All routes require authentication
router.use(authenticateToken);

// POST /api/hikes/:id/interest - Toggle interest in hike
router.post('/:id/interest', interestController.toggleInterest);

// POST /api/hikes/:id/confirm - Confirm/unconfirm attendance
router.post('/:id/confirm', interestController.confirmAttendance);

// POST /api/hikes/:id/cancel - Cancel attendance
router.post('/:id/cancel', interestController.cancelAttendance);

module.exports = router;
