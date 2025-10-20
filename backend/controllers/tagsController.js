// controllers/tagsController.js - Tags Controller
const pool = require('../config/database');

// GET /api/tags - Get all tags
exports.getTags = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM tags WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY category, name';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      tags: result.rows
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      details: error.message
    });
  }
};

// GET /api/tags/categories - Get tag categories
exports.getTagCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        category,
        COUNT(*) as tag_count
      FROM tags
      GROUP BY category
      ORDER BY category`
    );

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Get tag categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag categories',
      details: error.message
    });
  }
};

// GET /api/tags/popular - Get most used tags
exports.getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const result = await pool.query(
      `SELECT * FROM tags
       WHERE usage_count > 0
       ORDER BY usage_count DESC, name
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      tags: result.rows
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular tags',
      details: error.message
    });
  }
};

// POST /api/tags - Create new tag
exports.createTag = async (req, res) => {
  try {
    const {
      name,
      category = 'custom',
      description,
      color = '#6366F1',
      icon
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tag name is required'
      });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if tag already exists
    const existing = await pool.query(
      'SELECT id FROM tags WHERE name ILIKE $1 OR slug = $2',
      [name, slug]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Tag with this name already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO tags (name, slug, category, description, color, icon, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [name.trim(), slug, category, description, color, icon, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      tag: result.rows[0]
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tag',
      details: error.message
    });
  }
};

// PUT /api/tags/:id - Update tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, color, icon } = req.body;

    // If name is being updated, update slug too
    let slug = null;
    if (name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Check if new name/slug conflicts with existing tag
      const existing = await pool.query(
        'SELECT id FROM tags WHERE (name ILIKE $1 OR slug = $2) AND id != $3',
        [name, slug, id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Tag with this name already exists'
        });
      }
    }

    const result = await pool.query(
      `UPDATE tags
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           category = COALESCE($3, category),
           description = COALESCE($4, description),
           color = COALESCE($5, color),
           icon = COALESCE($6, icon),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, slug, category, description, color, icon, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag updated successfully',
      tag: result.rows[0]
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tag',
      details: error.message
    });
  }
};

// DELETE /api/tags/:id - Delete tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tag is in use
    const usage = await pool.query(
      'SELECT COUNT(*) as count FROM event_tags WHERE tag_id = $1',
      [id]
    );

    if (parseInt(usage.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete tag that is in use. Remove it from all events first.',
        usage_count: parseInt(usage.rows[0].count)
      });
    }

    const result = await pool.query(
      'DELETE FROM tags WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully',
      tag: result.rows[0]
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tag',
      details: error.message
    });
  }
};

// GET /api/events/:id/tags - Get tags for an event
exports.getEventTags = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, et.added_by, et.added_at
       FROM tags t
       JOIN event_tags et ON t.id = et.tag_id
       WHERE et.event_id = $1
       ORDER BY t.category, t.name`,
      [id]
    );

    res.json({
      success: true,
      tags: result.rows
    });
  } catch (error) {
    console.error('Get event tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event tags',
      details: error.message
    });
  }
};

// POST /api/events/:id/tags - Add tags to event
exports.addEventTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;

    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tag_ids must be a non-empty array'
      });
    }

    // Verify event exists
    const eventCheck = await pool.query('SELECT id FROM hikes WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Insert tags (ignore if already exists)
    const values = tag_ids.map((tag_id, index) => {
      const paramStart = index * 3 + 1;
      return `($${paramStart}, $${paramStart + 1}, $${paramStart + 2})`;
    }).join(', ');

    const params = tag_ids.flatMap(tag_id => [id, tag_id, req.user.id]);

    await pool.query(
      `INSERT INTO event_tags (event_id, tag_id, added_by)
       VALUES ${values}
       ON CONFLICT (event_id, tag_id) DO NOTHING`,
      params
    );

    // Get updated tags
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN event_tags et ON t.id = et.tag_id
       WHERE et.event_id = $1
       ORDER BY t.category, t.name`,
      [id]
    );

    res.json({
      success: true,
      message: 'Tags added successfully',
      tags: result.rows
    });
  } catch (error) {
    console.error('Add event tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add tags to event',
      details: error.message
    });
  }
};

// PUT /api/tags/events/:id - Replace all tags for an event
exports.updateEventTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;

    if (!Array.isArray(tag_ids)) {
      return res.status(400).json({
        success: false,
        error: 'tag_ids must be an array'
      });
    }

    // Verify event exists
    const eventCheck = await pool.query('SELECT id FROM hikes WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete all existing tags for this event
      await client.query('DELETE FROM event_tags WHERE event_id = $1', [id]);

      // Insert new tags if any
      if (tag_ids.length > 0) {
        const values = tag_ids.map((tag_id, index) => {
          const paramStart = index * 3 + 1;
          return `($${paramStart}, $${paramStart + 1}, $${paramStart + 2})`;
        }).join(', ');

        const params = tag_ids.flatMap(tag_id => [id, tag_id, req.user.id]);

        await client.query(
          `INSERT INTO event_tags (event_id, tag_id, added_by)
           VALUES ${values}`,
          params
        );
      }

      await client.query('COMMIT');

      // Get updated tags
      const result = await pool.query(
        `SELECT t.* FROM tags t
         JOIN event_tags et ON t.id = et.tag_id
         WHERE et.event_id = $1
         ORDER BY t.category, t.name`,
        [id]
      );

      res.json({
        success: true,
        message: 'Tags updated successfully',
        tags: result.rows
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update event tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event tags',
      details: error.message
    });
  }
};

// DELETE /api/events/:id/tags/:tagId - Remove tag from event
exports.removeEventTag = async (req, res) => {
  try {
    const { id, tagId } = req.params;

    const result = await pool.query(
      'DELETE FROM event_tags WHERE event_id = $1 AND tag_id = $2 RETURNING *',
      [id, tagId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found on this event'
      });
    }

    res.json({
      success: true,
      message: 'Tag removed from event successfully'
    });
  } catch (error) {
    console.error('Remove event tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove tag from event',
      details: error.message
    });
  }
};
