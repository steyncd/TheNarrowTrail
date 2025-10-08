const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Public route - Get content by key (NO AUTH REQUIRED)
router.get('/:key', async (req, res) => {
  console.log(`PUBLIC CONTENT API HIT: ${req.params.key}`);
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT id, content_key, title, content, updated_at FROM site_content WHERE content_key = $1 AND is_published = true',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log(`Successfully returning content for key: ${key}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

module.exports = router;
