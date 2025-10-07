// routes/hikes.js - Hike routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const hikeController = require('../controllers/hikeController');

// Public routes (no authentication required)
// GET /api/hikes/public - Get public hikes for landing page
router.get('/public', hikeController.getPublicHikes);

// Authenticated user routes
// GET /api/hikes - Get all hikes (authenticated)
router.get('/', authenticateToken, hikeController.getHikes);

// GET /api/hikes/:id/my-status - Get hike status for current user
router.get('/:id/my-status', authenticateToken, hikeController.getMyHikeStatus);

// POST /api/hikes/:id/confirm-attendance - Confirm/unconfirm attendance
router.post('/:id/confirm-attendance', authenticateToken, hikeController.confirmAttendance);

// GET /api/hikes/:id/comments - Get comments for a hike
router.get('/:id/comments', authenticateToken, hikeController.getComments);

// POST /api/hikes/:id/comments - Add comment to hike
router.post('/:id/comments', authenticateToken, hikeController.addComment);

// DELETE /api/hikes/:hikeId/comments/:commentId - Delete comment
router.delete('/:hikeId/comments/:commentId', authenticateToken, hikeController.deleteComment);

// Carpool routes
// GET /api/hikes/:id/carpool-offers - Get carpool offers
router.get('/:id/carpool-offers', authenticateToken, hikeController.getCarpoolOffers);

// POST /api/hikes/:id/carpool-offers - Create carpool offer
router.post('/:id/carpool-offers', authenticateToken, hikeController.createCarpoolOffer);

// DELETE /api/hikes/:hikeId/carpool-offers/:offerId - Delete carpool offer
router.delete('/:hikeId/carpool-offers/:offerId', authenticateToken, hikeController.deleteCarpoolOffer);

// GET /api/hikes/:id/carpool-requests - Get carpool requests
router.get('/:id/carpool-requests', authenticateToken, hikeController.getCarpoolRequests);

// POST /api/hikes/:id/carpool-requests - Create/update carpool request
router.post('/:id/carpool-requests', authenticateToken, hikeController.createCarpoolRequest);

// DELETE /api/hikes/:hikeId/carpool-requests/:requestId - Delete carpool request
router.delete('/:hikeId/carpool-requests/:requestId', authenticateToken, hikeController.deleteCarpoolRequest);

// Packing list routes
// GET /api/hikes/:id/packing-list - Get packing list
router.get('/:id/packing-list', authenticateToken, hikeController.getPackingList);

// PUT /api/hikes/:id/packing-list - Update packing list
router.put('/:id/packing-list', authenticateToken, hikeController.updatePackingList);

// Admin-only hike management routes
// POST /api/hikes - Create hike
router.post('/', authenticateToken, requireAdmin, hikeController.createHike);

// PUT /api/hikes/:id - Update hike
router.put('/:id', authenticateToken, requireAdmin, hikeController.updateHike);

// DELETE /api/hikes/:id - Delete hike
router.delete('/:id', authenticateToken, requireAdmin, hikeController.deleteHike);

// GET /api/hikes/:id/interested - Get interested users (Admin only)
router.get('/:id/interested', authenticateToken, requireAdmin, hikeController.getInterestedUsers);

// GET /api/hikes/:id/attendees - Get attendees (Admin only)
router.get('/:id/attendees', authenticateToken, requireAdmin, hikeController.getAttendees);

// POST /api/hikes/:id/attendees - Add attendee (Admin only)
router.post('/:id/attendees', authenticateToken, requireAdmin, hikeController.addAttendee);

// PUT /api/hikes/:hikeId/attendees/:userId - Update attendee (Admin only)
router.put('/:hikeId/attendees/:userId', authenticateToken, requireAdmin, hikeController.updateAttendee);

// DELETE /api/hikes/:hikeId/attendees/:userId - Remove attendee (Admin only)
router.delete('/:hikeId/attendees/:userId', authenticateToken, requireAdmin, hikeController.removeAttendee);

// GET /api/hikes/:id/default-packing-list - Get default packing list (Admin only)
router.get('/:id/default-packing-list', authenticateToken, requireAdmin, hikeController.getDefaultPackingList);

// PUT /api/hikes/:id/default-packing-list - Update default packing list (Admin only)
router.put('/:id/default-packing-list', authenticateToken, requireAdmin, hikeController.updateDefaultPackingList);

// GET /api/hikes/:id/emergency-contacts - Get emergency contacts for hike (Admin only)
router.get('/:id/emergency-contacts', authenticateToken, requireAdmin, hikeController.getHikeEmergencyContacts);

// GET /api/hikes/:id - Get single hike details (public for sharing)
// IMPORTANT: This must be LAST to avoid catching other /:id/* routes
router.get('/:id', (req, res, next) => {
  console.log(`[ROUTE] GET /api/hikes/${req.params.id} - getHikeById handler called`);
  hikeController.getHikeById(req, res, next);
});

module.exports = router;
