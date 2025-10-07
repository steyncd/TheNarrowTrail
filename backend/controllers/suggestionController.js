const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail } = require('../services/notificationService');

// Submit a new suggestion
exports.submitSuggestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { suggestion_type, suggested_date, destination_name, destination_description, message } = req.body;

    // Get user info
    const userResult = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Insert suggestion
    const result = await pool.query(
      `INSERT INTO suggestions
       (user_id, user_name, user_email, suggestion_type, suggested_date, destination_name, destination_description, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
       RETURNING *`,
      [userId, user.name, user.email, suggestion_type, suggested_date || null, destination_name || null, destination_description || null, message || null]
    );

    const suggestion = result.rows[0];

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      userId,
      'submit_suggestion',
      'suggestion',
      suggestion.id,
      JSON.stringify({ type: suggestion_type, destination: destination_name }),
      ipAddress
    );

    // Send email notification to admins
    try {
      const adminsResult = await pool.query(
        'SELECT email, name FROM users WHERE role = $1',
        ['admin']
      );

      for (const admin of adminsResult.rows) {
        await sendEmail(
          admin.email,
          'New Hike Suggestion Received',
          `
            <h2>New Hike Suggestion</h2>
            <p>A new hike suggestion has been submitted by ${user.name}.</p>
            <p><strong>Type:</strong> ${suggestion_type}</p>
            ${suggested_date ? `<p><strong>Suggested Date:</strong> ${suggested_date}</p>` : ''}
            ${destination_name ? `<p><strong>Destination:</strong> ${destination_name}</p>` : ''}
            ${destination_description ? `<p><strong>Description:</strong> ${destination_description}</p>` : ''}
            ${message ? `<p><strong>Additional Notes:</strong> ${message}</p>` : ''}
            <p>View all suggestions in the admin panel.</p>
          `
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({
      message: 'Suggestion submitted successfully',
      suggestion
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
};

// Get all suggestions (admin only)
exports.getAllSuggestions = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = 'SELECT * FROM suggestions WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (type) {
      params.push(type);
      query += ` AND suggestion_type = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      suggestions: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// Get suggestion statistics (admin only)
exports.getSuggestionStats = async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM suggestions
    `);

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching suggestion stats:', error);
    res.status(500).json({ error: 'Failed to fetch suggestion statistics' });
  }
};

// Update suggestion status (admin only)
exports.updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const result = await pool.query(
      `UPDATE suggestions
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    const suggestion = result.rows[0];

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'update_suggestion_status',
      'suggestion',
      id,
      JSON.stringify({ new_status: status }),
      ipAddress
    );

    res.json({
      message: 'Suggestion updated successfully',
      suggestion
    });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
};

// Delete suggestion (admin only)
exports.deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM suggestions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'delete_suggestion',
      'suggestion',
      id,
      null,
      ipAddress
    );

    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
};
