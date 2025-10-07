// routes/photos.js - Photo routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const photoController = require('../controllers/photoController');

// All photo routes require authentication
router.use(authenticateToken);

// GET /api/photos - Get all photos
router.get('/', photoController.getPhotos);

// POST /api/photos - Upload photo
router.post('/', photoController.uploadPhoto);

// DELETE /api/photos/:id - Delete photo
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
