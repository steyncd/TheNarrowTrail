// controllers/photoController.js - Photo controller
const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Get all photos
exports.getPhotos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM photos ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

// Upload photo
exports.uploadPhoto = async (req, res) => {
  try {
    const { hike_name, date, url } = req.body;
    const userId = req.user.id;

    // Get user name
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const uploadedBy = userResult.rows[0].name;

    const result = await pool.query(
      `INSERT INTO photos (hike_name, date, url, uploaded_by, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [hike_name, date, url, uploadedBy, userId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'upload_photo', 'photo', result.rows[0].id, JSON.stringify({ hike_name }), ipAddress);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Check if user owns the photo or is admin
    const photoResult = await pool.query('SELECT user_id FROM photos WHERE id = $1', [id]);

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (!isAdmin && photoResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};
