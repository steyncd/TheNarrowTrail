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
      // Remove interest (only if not confirmed)
      if (existing.rows[0].attendance_status === 'confirmed') {
        return res.status(400).json({ error: 'Cannot remove interest after confirming attendance. Please cancel attendance first.' });
      }

      await pool.query(
        'DELETE FROM hike_interest WHERE hike_id = $1 AND user_id = $2',
        [id, userId]
      );

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(userId, 'remove_interest', 'hike', id, null, ipAddress);

      res.json({ interested: false });
    } else {
      // Add interest with status 'interested'
      await pool.query(
        'INSERT INTO hike_interest (hike_id, user_id, attendance_status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [id, userId, 'interested']
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

// Confirm attendance (user must be interested first)
exports.confirmAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has expressed interest
    const existing = await pool.query(
      'SELECT * FROM hike_interest WHERE hike_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ error: 'Must express interest first before confirming attendance' });
    }

    const currentStatus = existing.rows[0].attendance_status;

    // Toggle between confirmed and interested
    if (currentStatus === 'confirmed') {
      // Unconfirm - back to interested
      await pool.query(
        'UPDATE hike_interest SET attendance_status = $1, updated_at = NOW() WHERE hike_id = $2 AND user_id = $3',
        ['interested', id, userId]
      );

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(userId, 'unconfirm_attendance', 'hike', id, null, ipAddress);

      res.json({ confirmed: false, attendance_status: 'interested' });
    } else {
      // Confirm attendance
      await pool.query(
        'UPDATE hike_interest SET attendance_status = $1, updated_at = NOW() WHERE hike_id = $2 AND user_id = $3',
        ['confirmed', id, userId]
      );

      // Get hike and user info for notifications
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
            'Hike Attendance Confirmed',
            `<p><strong>${user.name}</strong> has confirmed attendance for <strong>${hike.name}</strong> on ${hikeDate}.</p>`
          );
        }
        if (admin.notifications_whatsapp) {
          await sendWhatsApp(
            admin.phone,
            `${user.name} has confirmed attendance for ${hike.name} on ${hikeDate}.`
          );
        }
      }

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      await logActivity(userId, 'confirm_attendance', 'hike', id, JSON.stringify({ hike_name: hike.name }), ipAddress);

      res.json({ confirmed: true, attendance_status: 'confirmed' });
    }
  } catch (error) {
    console.error('Confirm attendance error:', error);
    res.status(500).json({ error: 'Failed to confirm attendance' });
  }
};

// Cancel attendance
exports.cancelAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT * FROM hike_interest WHERE hike_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'No interest record found' });
    }

    // Update to cancelled
    await pool.query(
      'UPDATE hike_interest SET attendance_status = $1, updated_at = NOW() WHERE hike_id = $2 AND user_id = $3',
      ['cancelled', id, userId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'cancel_attendance', 'hike', id, null, ipAddress);

    res.json({ success: true, attendance_status: 'cancelled' });
  } catch (error) {
    console.error('Cancel attendance error:', error);
    res.status(500).json({ error: 'Failed to cancel attendance' });
  }
};
