const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { getWeatherForecast, getHikingSuitability, clearWeatherCache, getWeatherCacheStats } = require('../services/weatherService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get weather forecast for a hike
router.get('/hike/:hikeId', authenticateToken, async (req, res) => {
  const { hikeId } = req.params;

  try {
    // Get hike details
    const hikeResult = await pool.query(
      'SELECT * FROM hikes WHERE id = $1',
      [hikeId]
    );

    if (hikeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    const hike = hikeResult.rows[0];

    // Get weather forecast
    const weather = await getWeatherForecast(hike.location, hike.date);

    if (!weather) {
      return res.json({
        available: false,
        message: 'Weather forecast not available for this date or location'
      });
    }

    // Get hiking suitability
    const suitability = getHikingSuitability(weather);

    res.json({
      available: true,
      weather,
      suitability,
      hike: {
        id: hike.id,
        name: hike.name,
        location: hike.location,
        date: hike.date
      }
    });
  } catch (error) {
    console.error('Error fetching weather for hike:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Get weather forecast by location and date
router.get('/forecast', authenticateToken, async (req, res) => {
  const { location, date } = req.query;

  if (!location || !date) {
    return res.status(400).json({ error: 'Location and date are required' });
  }

  try {
    const weather = await getWeatherForecast(location, date);

    if (!weather) {
      return res.json({
        available: false,
        message: 'Weather forecast not available for this date or location'
      });
    }

    const suitability = getHikingSuitability(weather);

    res.json({
      available: true,
      weather,
      suitability
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Get cache statistics (admin only)
router.get('/cache/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = getWeatherCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// Clear weather cache (admin only)
router.post('/cache/clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = clearWeatherCache();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
