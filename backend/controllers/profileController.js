// controllers/profileController.js - User Profile Management
const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Get user basic info
    const userResult = await pool.query(
      `SELECT
        id, name, email, phone, role,
        profile_photo_url, bio, hiking_since,
        experience_level, preferred_difficulty, profile_visibility,
        created_at
      FROM users
      WHERE id = $1 AND status = 'approved'`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check privacy settings
    if (user.profile_visibility === 'private' && user.id !== requestingUserId) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    // Don't expose email/phone unless it's the user's own profile
    if (user.id !== requestingUserId) {
      delete user.email;
      delete user.phone;
    }

    // Get user statistics
    const stats = await getUserStatistics(userId);

    res.json({
      user,
      stats
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get user statistics
async function getUserStatistics(userId) {
  try {
    const statsQuery = `
      SELECT
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' AND h.date < CURRENT_DATE THEN hi.hike_id END) as hikes_completed,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' AND h.date >= CURRENT_DATE THEN hi.hike_id END) as hikes_upcoming,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'interested' THEN hi.hike_id END) as hikes_interested,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.hike_id END) as total_confirmed,
        MAX(h.date) FILTER (WHERE hi.attendance_status = 'confirmed' AND h.date < CURRENT_DATE) as last_hike_date,
        MIN(h.date) FILTER (WHERE hi.attendance_status = 'confirmed') as first_hike_date,
        MODE() WITHIN GROUP (ORDER BY h.difficulty) FILTER (WHERE hi.attendance_status = 'confirmed') as favorite_difficulty,
        MODE() WITHIN GROUP (ORDER BY h.type) FILTER (WHERE hi.attendance_status = 'confirmed') as favorite_type
      FROM hike_interest hi
      LEFT JOIN hikes h ON hi.hike_id = h.id
      WHERE hi.user_id = $1
    `;

    const result = await pool.query(statsQuery, [userId]);
    const stats = result.rows[0];

    // Calculate completion rate
    const totalInterested = parseInt(stats.total_confirmed) + parseInt(stats.hikes_interested);
    stats.completion_rate = totalInterested > 0
      ? Math.round((parseInt(stats.hikes_completed) / totalInterested) * 100)
      : 0;

    // Convert counts to numbers
    stats.hikes_completed = parseInt(stats.hikes_completed) || 0;
    stats.hikes_upcoming = parseInt(stats.hikes_upcoming) || 0;
    stats.hikes_interested = parseInt(stats.hikes_interested) || 0;
    stats.total_confirmed = parseInt(stats.total_confirmed) || 0;

    return stats;
  } catch (err) {
    console.error('Get user statistics error:', err);
    return {
      hikes_completed: 0,
      hikes_upcoming: 0,
      hikes_interested: 0,
      total_confirmed: 0,
      completion_rate: 0,
      last_hike_date: null,
      first_hike_date: null,
      favorite_difficulty: null,
      favorite_type: null
    };
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bio,
      hiking_since,
      experience_level,
      preferred_difficulty,
      profile_visibility,
      profile_photo_url
    } = req.body;

    // Validate experience level
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (experience_level && !validExperienceLevels.includes(experience_level)) {
      return res.status(400).json({ error: 'Invalid experience level' });
    }

    // Validate profile visibility
    const validVisibility = ['public', 'members_only', 'private'];
    if (profile_visibility && !validVisibility.includes(profile_visibility)) {
      return res.status(400).json({ error: 'Invalid profile visibility' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (hiking_since !== undefined) {
      updates.push(`hiking_since = $${paramCount++}`);
      values.push(hiking_since);
    }
    if (experience_level !== undefined) {
      updates.push(`experience_level = $${paramCount++}`);
      values.push(experience_level);
    }
    if (preferred_difficulty !== undefined) {
      updates.push(`preferred_difficulty = $${paramCount++}`);
      values.push(preferred_difficulty);
    }
    if (profile_visibility !== undefined) {
      updates.push(`profile_visibility = $${paramCount++}`);
      values.push(profile_visibility);
    }
    if (profile_photo_url !== undefined) {
      updates.push(`profile_photo_url = $${paramCount++}`);
      values.push(profile_photo_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, profile_photo_url, bio, hiking_since,
                experience_level, preferred_difficulty, profile_visibility
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'update_profile', 'user', userId, JSON.stringify({ fields: Object.keys(req.body) }), ipAddress);

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user statistics (standalone endpoint)
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getUserStatistics(userId);
    res.json(stats);
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

module.exports = exports;
