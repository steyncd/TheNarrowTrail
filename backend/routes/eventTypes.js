// routes/eventTypes.js - Event Types routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const eventTypesController = require('../controllers/eventTypesController');

// Public routes
// GET /api/event-types - Get all event types
router.get('/', eventTypesController.getEventTypes);

// GET /api/event-types/stats - Get event type statistics
router.get('/stats', eventTypesController.getEventTypeStats);

// GET /api/event-types/:name - Get single event type by name
router.get('/:name', eventTypesController.getEventType);

// Admin routes
// POST /api/event-types - Create new event type
router.post('/', authenticateToken, requirePermission('settings.edit'), eventTypesController.createEventType);

// PUT /api/event-types/:id - Update event type
router.put('/:id', authenticateToken, requirePermission('settings.edit'), eventTypesController.updateEventType);

module.exports = router;
