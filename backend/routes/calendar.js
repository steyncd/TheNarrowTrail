// routes/calendar.js - iCalendar export for hikes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');
const ical = require('ical-generator').default;

// Get user's hikes as iCalendar
router.get('/my-hikes.ics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hikes the user is interested in
    const result = await pool.query(
      `SELECT h.*
       FROM hikes h
       JOIN interest i ON h.id = i.hike_id
       WHERE i.user_id = $1
       ORDER BY h.date`,
      [userId]
    );

    const calendar = ical({ name: 'My Hikes - The Narrow Trail' });

    result.rows.forEach(hike => {
      const startDate = new Date(hike.date);
      const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8 hours later

      let description = hike.description || '';
      if (hike.difficulty) description += `\nDifficulty: ${hike.difficulty}`;
      if (hike.distance) description += `\nDistance: ${hike.distance}km`;
      if (hike.duration) description += `\nDuration: ${hike.duration} hours`;
      if (hike.price) description += `\nPrice: R${hike.price}`;

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: hike.name,
        description: description,
        location: hike.location,
        url: `${process.env.FRONTEND_URL || 'https://helloliam.web.app'}/hikes/${hike.id}`,
        status: hike.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'
      });
    });

    res.type('text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="my-hikes.ics"');
    res.send(calendar.toString());
  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({ error: 'Failed to export calendar' });
  }
});

// Get all hikes as iCalendar (public)
router.get('/all-hikes.ics', async (req, res) => {
  try {
    // Get all approved hikes
    const result = await pool.query(
      `SELECT * FROM hikes WHERE status != 'cancelled' ORDER BY date`
    );

    const calendar = ical({ name: 'All Hikes - The Narrow Trail' });

    result.rows.forEach(hike => {
      const startDate = new Date(hike.date);
      const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000);

      let description = hike.description || '';
      if (hike.difficulty) description += `\nDifficulty: ${hike.difficulty}`;
      if (hike.distance) description += `\nDistance: ${hike.distance}km`;
      if (hike.duration) description += `\nDuration: ${hike.duration} hours`;

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: hike.name,
        description: description,
        location: hike.location,
        url: `${process.env.FRONTEND_URL || 'https://helloliam.web.app'}/hikes/${hike.id}`
      });
    });

    res.type('text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="all-hikes.ics"');
    res.send(calendar.toString());
  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({ error: 'Failed to export calendar' });
  }
});

module.exports = router;
