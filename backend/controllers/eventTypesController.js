// controllers/eventTypesController.js - Event Types Controller
const pool = require('../config/database');

// GET /api/event-types - Get all event types
exports.getEventTypes = async (req, res) => {
  try {
    const { active_only = 'true' } = req.query;

    let query = 'SELECT * FROM event_types';
    const params = [];

    if (active_only === 'true') {
      query += ' WHERE active = true';
    }

    query += ' ORDER BY sort_order, name';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      eventTypes: result.rows
    });
  } catch (error) {
    console.error('Get event types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event types',
      details: error.message
    });
  }
};

// GET /api/event-types/:name - Get single event type by name
exports.getEventType = async (req, res) => {
  try {
    const { name } = req.params;

    const result = await pool.query(
      'SELECT * FROM event_types WHERE name = $1',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found'
      });
    }

    res.json({
      success: true,
      eventType: result.rows[0]
    });
  } catch (error) {
    console.error('Get event type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event type',
      details: error.message
    });
  }
};

// POST /api/event-types - Create new event type (admin only)
exports.createEventType = async (req, res) => {
  try {
    const {
      name,
      display_name,
      icon,
      color,
      description,
      sort_order = 99,
      active = true
    } = req.body;

    // Validation
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        error: 'Name and display_name are required'
      });
    }

    // Check if event type already exists
    const existing = await pool.query(
      'SELECT id FROM event_types WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Event type with this name already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO event_types (name, display_name, icon, color, description, sort_order, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [name, display_name, icon, color, description, sort_order, active]
    );

    res.status(201).json({
      success: true,
      message: 'Event type created successfully',
      eventType: result.rows[0]
    });
  } catch (error) {
    console.error('Create event type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event type',
      details: error.message
    });
  }
};

// PUT /api/event-types/:id - Update event type (admin only)
exports.updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      display_name,
      icon,
      color,
      description,
      sort_order,
      active
    } = req.body;

    const result = await pool.query(
      `UPDATE event_types
       SET display_name = COALESCE($1, display_name),
           icon = COALESCE($2, icon),
           color = COALESCE($3, color),
           description = COALESCE($4, description),
           sort_order = COALESCE($5, sort_order),
           active = COALESCE($6, active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [display_name, icon, color, description, sort_order, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found'
      });
    }

    res.json({
      success: true,
      message: 'Event type updated successfully',
      eventType: result.rows[0]
    });
  } catch (error) {
    console.error('Update event type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event type',
      details: error.message
    });
  }
};

// GET /api/event-types/stats - Get event type statistics
exports.getEventTypeStats = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        et.id,
        et.name,
        et.display_name,
        et.color,
        et.icon,
        COUNT(h.id) as event_count,
        COUNT(DISTINCT hi.user_id) as total_participants
      FROM event_types et
      LEFT JOIN hikes h ON h.event_type = et.name AND h.status != 'cancelled'
      LEFT JOIN hike_interest hi ON hi.hike_id = h.id AND hi.status = 'confirmed'
      WHERE et.active = true
      GROUP BY et.id, et.name, et.display_name, et.color, et.icon
      ORDER BY et.sort_order, et.name`
    );

    res.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    console.error('Get event type stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event type statistics',
      details: error.message
    });
  }
};
