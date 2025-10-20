// routes/tags.js - Tags routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const tagsController = require('../controllers/tagsController');

// Public/Authenticated routes
// GET /api/tags - Get all tags
router.get('/', tagsController.getTags);

// GET /api/tags/categories - Get tag categories
router.get('/categories', tagsController.getTagCategories);

// GET /api/tags/popular - Get most used tags
router.get('/popular', tagsController.getPopularTags);

// Authenticated routes
// POST /api/tags - Create new tag
router.post('/', authenticateToken, tagsController.createTag);

// PUT /api/tags/:id - Update tag
router.put('/:id', authenticateToken, requirePermission('settings.edit'), tagsController.updateTag);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', authenticateToken, requirePermission('settings.edit'), tagsController.deleteTag);

// Event-specific tag routes (moved from tagsController for better organization)
// GET /api/tags/events/:id - Get tags for an event
router.get('/events/:id', tagsController.getEventTags);

// POST /api/tags/events/:id - Add tags to event
router.post('/events/:id', authenticateToken, requirePermission('hikes.edit'), tagsController.addEventTags);

// PUT /api/tags/events/:id - Replace all tags for an event
router.put('/events/:id', authenticateToken, requirePermission('hikes.edit'), tagsController.updateEventTags);

// DELETE /api/tags/events/:id/:tagId - Remove tag from event
router.delete('/events/:id/:tagId', authenticateToken, requirePermission('hikes.edit'), tagsController.removeEventTag);

module.exports = router;
