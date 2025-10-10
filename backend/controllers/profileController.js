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

// Delete user account (POPIA Right to Deletion)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Can only delete own account
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    // Verify password before deletion
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const validPassword = await bcrypt.compare(confirmPassword, userResult.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Log the deletion before deleting
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'account_deleted', 'user', userId, JSON.stringify({ reason: 'user_request' }), ipAddress);

    // Delete user and all related data (cascading deletes should handle most)
    await pool.query('BEGIN');

    try {
      // Delete user's data
      await pool.query('DELETE FROM hike_photos WHERE uploaded_by = $1', [userId]);
      await pool.query('DELETE FROM hike_comments WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM hike_interest WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM emergency_contacts WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM user_feedback WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM hike_suggestions WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM payment_records WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM carpool_participation WHERE user_id = $1', [userId]);
      
      // Delete the user account (activity logs preserved for audit)
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      await pool.query('COMMIT');

      res.json({
        success: true,
        message: 'Your account has been permanently deleted'
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Export user data (POPIA Right to Data Portability)
exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user data
    const userData = await pool.query(
      `SELECT id, name, email, phone, role, status, email_verified,
        profile_photo_url, bio, hiking_since, experience_level, preferred_difficulty,
        privacy_consent_accepted, privacy_consent_date,
        terms_accepted, terms_accepted_date,
        data_processing_consent, data_processing_consent_date,
        notification_preferences, notifications_email, notifications_whatsapp,
        created_at, updated_at
      FROM users WHERE id = $1`,
      [userId]
    );

    const hikeInterest = await pool.query(
      'SELECT * FROM hike_interest WHERE user_id = $1',
      [userId]
    );

    const emergencyContacts = await pool.query(
      'SELECT * FROM emergency_contacts WHERE user_id = $1',
      [userId]
    );

    const payments = await pool.query(
      'SELECT * FROM payment_records WHERE user_id = $1',
      [userId]
    );

    const photos = await pool.query(
      'SELECT * FROM hike_photos WHERE uploaded_by = $1',
      [userId]
    );

    const comments = await pool.query(
      'SELECT * FROM hike_comments WHERE user_id = $1',
      [userId]
    );

    const feedback = await pool.query(
      'SELECT * FROM user_feedback WHERE user_id = $1',
      [userId]
    );

    const suggestions = await pool.query(
      'SELECT * FROM hike_suggestions WHERE user_id = $1',
      [userId]
    );

    const exportData = {
      export_date: new Date().toISOString(),
      user_profile: userData.rows[0],
      hike_participation: hikeInterest.rows,
      emergency_contacts: emergencyContacts.rows,
      payments: payments.rows,
      photos: photos.rows,
      comments: comments.rows,
      feedback: feedback.rows,
      suggestions: suggestions.rows
    };

    // Log the export
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'data_export', 'user', userId, JSON.stringify({ export_size: JSON.stringify(exportData).length }), ipAddress);

    res.json({
      success: true,
      data: exportData
    });
  } catch (err) {
    console.error('Export user data error:', err);
    res.status(500).json({ error: 'Failed to export user data' });
  }
};

// Get user's data retention status
exports.getUserRetentionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic user information first
    let userQuery = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
    let userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user = userResult.rows[0];
    
    // Try to get retention-specific columns if they exist
    try {
      const retentionQuery = `SELECT
        COALESCE(last_active_at, created_at) as last_active_at,
        retention_warning_sent_at, scheduled_deletion_at,
        EXTRACT(DAYS FROM AGE(NOW(), COALESCE(last_active_at, created_at)))::int AS days_since_active,
        EXTRACT(DAYS FROM AGE(NOW(), created_at))::int AS account_age_days
      FROM users WHERE id = $1`;
      
      const retentionResult = await pool.query(retentionQuery, [userId]);
      if (retentionResult.rows.length > 0) {
        user = { ...user, ...retentionResult.rows[0] };
      }
    } catch (retentionError) {
      console.log('Retention columns not available, using defaults:', retentionError.message);
      // Use defaults if retention columns don't exist
      user.last_active_at = user.created_at;
      user.retention_warning_sent_at = null;
      user.scheduled_deletion_at = null;
      user.days_since_active = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
      user.account_age_days = user.days_since_active;
    }
    
    // Calculate retention status
    const accountAgeYears = Math.floor(user.account_age_days / 365);
    const daysSinceActive = user.days_since_active || 0;
    const inactiveYears = Math.floor(daysSinceActive / 365);
    
    let retentionStatus = 'active';
    let warningDate = null;
    let deletionDate = null;
    let daysUntilWarning = null;
    let daysUntilDeletion = null;
    
    if (user.retention_warning_sent_at) {
      retentionStatus = 'warning_sent';
      warningDate = user.retention_warning_sent_at;
    }
    
    if (user.scheduled_deletion_at) {
      retentionStatus = 'scheduled_for_deletion';
      deletionDate = user.scheduled_deletion_at;
      daysUntilDeletion = Math.ceil((new Date(user.scheduled_deletion_at) - new Date()) / (1000 * 60 * 60 * 24));
    } else if (inactiveYears >= 2) {
      // Calculate when warning will be sent (3 years of inactivity)
      const warningThreshold = new Date(user.last_active_at);
      warningThreshold.setFullYear(warningThreshold.getFullYear() + 3);
      daysUntilWarning = Math.ceil((warningThreshold - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilWarning <= 0) {
        retentionStatus = 'warning_due';
      }
    }
    
    // Get user's retention logs - handle missing table gracefully
    let recentActivity = [];
    try {
      const logsResult = await pool.query(
        `SELECT action, details, created_at
        FROM data_retention_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10`,
        [userId]
      );
      recentActivity = logsResult.rows;
    } catch (logError) {
      console.log('Data retention logs table not available:', logError.message);
      // Continue without logs - table might not exist yet
    }

    res.json({
      status: retentionStatus,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_active_at: user.last_active_at,
        account_age_days: user.account_age_days,
        days_since_active: daysSinceActive
      },
      retention: {
        warning_sent_at: warningDate,
        scheduled_deletion_at: deletionDate,
        days_until_warning: daysUntilWarning,
        days_until_deletion: daysUntilDeletion,
        inactive_years: inactiveYears
      },
      recent_activity: recentActivity
    });

  } catch (err) {
    console.error('Get user retention status error:', err);
    res.status(500).json({ error: 'Failed to get retention status' });
  }
};

module.exports = exports;

