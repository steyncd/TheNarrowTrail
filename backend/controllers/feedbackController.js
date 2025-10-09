// controllers/feedbackController.js - Feedback Controller
const pool = require('../config/database');
const { sendEmail } = require('../services/notificationService');
const { logActivity } = require('../utils/activityLogger');
const emailTemplates = require('../services/emailTemplates');

// Submit feedback (authenticated users)
exports.submitFeedback = async (req, res) => {
  try {
    const { feedback_type, message } = req.body;
    const userId = req.user.id;

    // Get user info
    const userResult = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Insert feedback
    const result = await pool.query(
      `INSERT INTO feedback (user_id, user_name, user_email, feedback_type, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'new', NOW())
       RETURNING *`,
      [userId, user.name, user.email, feedback_type, message]
    );

    const feedback = result.rows[0];

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(userId, 'submit_feedback', 'feedback', feedback.id, JSON.stringify({ type: feedback_type }), ipAddress);

    // Notify admins
    const admins = await pool.query(
      'SELECT email, notifications_email FROM users WHERE role = $1 AND status = $2',
      ['admin', 'approved']
    );

    for (const admin of admins.rows) {
      if (admin.notifications_email) {
        await sendEmail(
          admin.email,
          `New Feedback: ${feedback_type}`,
          emailTemplates.feedbackAdminEmail(user.name, user.email, feedback_type, message)
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const { status, type, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND feedback_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM feedback WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (status) {
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (type) {
      countQuery += ` AND feedback_type = $${countParamCount}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      feedback: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Update feedback status (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const result = await pool.query(
      `UPDATE feedback
       SET status = $1, admin_notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'update_feedback_status', 'feedback', id, JSON.stringify({ status }), ipAddress);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
};

// Get feedback statistics (Admin only)
exports.getFeedbackStats = async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_count,
        COUNT(*) FILTER (WHERE feedback_type = 'bug') as bug_count,
        COUNT(*) FILTER (WHERE feedback_type = 'feature') as feature_count,
        COUNT(*) FILTER (WHERE feedback_type = 'suggestion') as suggestion_count,
        COUNT(*) FILTER (WHERE feedback_type = 'compliment') as compliment_count,
        COUNT(*) FILTER (WHERE feedback_type = 'complaint') as complaint_count
      FROM feedback
    `);

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
};

// Delete feedback (Admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM feedback WHERE id = $1', [id]);

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'delete_feedback', 'feedback', id, null, ipAddress);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};
