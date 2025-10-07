// controllers/interestController.js - Interest controller
const pool = require('../config/database');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');
const { logActivity } = require('../utils/activityLogger');

// Toggle interest in hike
exports.toggleInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already interested
    const existing = await pool.query(
      'SELECT * FROM hike_interest WHERE hike_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length > 0) {
      // Remove interest
      await pool.query(
        'DELETE FROM hike_interest WHERE hike_id = $1 AND user_id = $2',
        [id, userId]
      );

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(userId, 'remove_interest', 'hike', id, null, ipAddress);

      res.json({ interested: false });
    } else {
      // Add interest
      await pool.query(
        'INSERT INTO hike_interest (hike_id, user_id, created_at) VALUES ($1, $2, NOW())',
        [id, userId]
      );

      // Get hike and user info
      const hikeResult = await pool.query('SELECT * FROM hikes WHERE id = $1', [id]);
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
      const hike = hikeResult.rows[0];
      const user = userResult.rows[0];

      // Notify admins
      const admins = await pool.query(
        'SELECT email, phone, notifications_email, notifications_whatsapp FROM users WHERE role = $1 AND status = $2',
        ['admin', 'approved']
      );

      const hikeDate = new Date(hike.date).toLocaleDateString();

      for (const admin of admins.rows) {
        if (admin.notifications_email) {
          await sendEmail(
            admin.email,
            'Hike Interest',
            `<p><strong>${user.name}</strong> is interested in <strong>${hike.name}</strong> on ${hikeDate}.</p>`
          );
        }
        if (admin.notifications_whatsapp) {
          await sendWhatsApp(
            admin.phone,
            `${user.name} is interested in ${hike.name} on ${hikeDate}.`
          );
        }
      }

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(userId, 'express_interest', 'hike', id, JSON.stringify({ hike_name: hike.name }), ipAddress);

      res.json({ interested: true });
    }
  } catch (error) {
    console.error('Toggle interest error:', error);
    res.status(500).json({ error: 'Failed to toggle interest' });
  }
};
