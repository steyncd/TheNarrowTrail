const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin route - Get all content (use specific path /admin/list)
router.get('/admin/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as updated_by_name
       FROM site_content c
       LEFT JOIN users u ON c.updated_by = u.id
       ORDER BY c.content_key`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get all content error:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Admin route - Get content history
router.get('/:key/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      `SELECT h.*, u.name as updated_by_name
       FROM site_content_history h
       LEFT JOIN users u ON h.updated_by = u.id
       WHERE h.content_key = $1
       ORDER BY h.updated_at DESC
       LIMIT 20`,
      [key]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get content history error:', err);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Public route - Get content by key (NO AUTH REQUIRED)
router.get('/:key', async (req, res) => {
  console.log(`PUBLIC CONTENT ROUTE HIT: ${req.params.key}`);
  try {
    const { key } = req.params;

    // Don't match /admin or /history
    if (key === 'admin' || key.includes('/')) {
      return res.status(404).json({ error: 'Not found' });
    }

    const result = await pool.query(
      'SELECT id, content_key, title, content, updated_at FROM site_content WHERE content_key = $1 AND is_published = true',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log(`Returning content for key: ${key}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Update content (admin only)
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { title, content, is_published } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `UPDATE site_content
       SET title = $1, content = $2, is_published = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
       WHERE content_key = $5
       RETURNING *`,
      [title, content, is_published !== false, userId, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, content: result.rows[0] });
  } catch (err) {
    console.error('Update content error:', err);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

module.exports = router;
