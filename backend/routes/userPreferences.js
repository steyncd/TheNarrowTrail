// routes/userPreferences.js - User Preferences API Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/preferences - Get user's preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default preferences if none exist
      return res.json({
        preferences: {
          preferred_event_types: [],
          preferred_difficulties: [],
          preferred_group_types: [],
          preferred_distances: [],
          hiking_frequency: '',
          preferred_days: [],
          max_travel_distance: '',
          budget_range: '',
          interests: []
        }
      });
    }

    res.json({ preferences: result.rows[0] });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences - Update user's preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      preferred_event_types,
      preferred_difficulties,
      preferred_group_types,
      preferred_distances,
      hiking_frequency,
      preferred_days,
      max_travel_distance,
      budget_range,
      interests
    } = req.body;

    // Upsert (insert or update)
    const result = await pool.query(
      `INSERT INTO user_preferences (
        user_id, preferred_event_types, preferred_difficulties, preferred_group_types,
        preferred_distances, hiking_frequency, preferred_days, max_travel_distance,
        budget_range, interests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_event_types = $2,
        preferred_difficulties = $3,
        preferred_group_types = $4,
        preferred_distances = $5,
        hiking_frequency = $6,
        preferred_days = $7,
        max_travel_distance = $8,
        budget_range = $9,
        interests = $10,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        userId,
        preferred_event_types || [],
        preferred_difficulties || [],
        preferred_group_types || [],
        preferred_distances || [],
        hiking_frequency || '',
        preferred_days || [],
        max_travel_distance || '',
        budget_range || '',
        interests || []
      ]
    );

    res.json({
      success: true,
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// DELETE /api/preferences - Delete user's preferences
router.delete('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Preferences deleted successfully'
    });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({ error: 'Failed to delete preferences' });
  }
});

module.exports = router;
