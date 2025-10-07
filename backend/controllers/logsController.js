// controllers/logsController.js - Logs Controller for Admin
const pool = require('../config/database');

// Get signin logs (Admin only)
exports.getSigninLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0, userId, success } = req.query;

    let query = `
      SELECT
        sl.id,
        sl.user_id,
        u.name as user_name,
        u.email as user_email,
        sl.signin_time,
        sl.ip_address,
        sl.user_agent,
        sl.success
      FROM signin_log sl
      LEFT JOIN users u ON sl.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND sl.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (success !== undefined) {
      query += ` AND sl.success = $${paramCount}`;
      params.push(success === 'true');
      paramCount++;
    }

    query += ` ORDER BY sl.signin_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM signin_log sl WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (userId) {
      countQuery += ` AND sl.user_id = $${countParamCount}`;
      countParams.push(userId);
      countParamCount++;
    }

    if (success !== undefined) {
      countQuery += ` AND sl.success = $${countParamCount}`;
      countParams.push(success === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get signin logs error:', error);
    res.status(500).json({ error: 'Failed to fetch signin logs' });
  }
};

// Get activity logs (Admin only)
exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0, userId, action, entityType } = req.query;

    let query = `
      SELECT
        al.id,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.created_at
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (entityType) {
      query += ` AND al.entity_type = $${paramCount}`;
      params.push(entityType);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM activity_log al WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (userId) {
      countQuery += ` AND al.user_id = $${countParamCount}`;
      countParams.push(userId);
      countParamCount++;
    }

    if (action) {
      countQuery += ` AND al.action = $${countParamCount}`;
      countParams.push(action);
      countParamCount++;
    }

    if (entityType) {
      countQuery += ` AND al.entity_type = $${countParamCount}`;
      countParams.push(entityType);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

// Get activity summary stats (Admin only)
exports.getActivityStats = async (req, res) => {
  try {
    // Get login stats for last 30 days
    const loginStatsResult = await pool.query(`
      SELECT
        DATE(signin_time) as date,
        COUNT(*) as total_logins,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_logins,
        SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_logins
      FROM signin_log
      WHERE signin_time >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(signin_time)
      ORDER BY date DESC
    `);

    // Get top actions
    const topActionsResult = await pool.query(`
      SELECT action, COUNT(*) as count
      FROM activity_log
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get most active users
    const activeUsersResult = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(al.id) as activity_count
      FROM users u
      JOIN activity_log al ON u.id = al.user_id
      WHERE al.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.name, u.email
      ORDER BY activity_count DESC
      LIMIT 10
    `);

    res.json({
      loginStats: loginStatsResult.rows,
      topActions: topActionsResult.rows,
      activeUsers: activeUsersResult.rows
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
};
