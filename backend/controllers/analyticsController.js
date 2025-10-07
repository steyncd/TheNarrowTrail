// controllers/analyticsController.js - Analytics Dashboard
const pool = require('../config/database');

// Cache for analytics data (5 minute TTL)
let analyticsCache = {
  overview: { data: null, timestamp: null },
  users: { data: null, timestamp: null },
  hikes: { data: null, timestamp: null }
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(cacheEntry) {
  return cacheEntry.data && cacheEntry.timestamp &&
         (Date.now() - cacheEntry.timestamp) < CACHE_TTL;
}

// Get analytics overview
exports.getOverview = async (req, res) => {
  try {
    // Check cache
    if (isCacheValid(analyticsCache.overview)) {
      return res.json(analyticsCache.overview.data);
    }

    const overviewQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE status = 'approved') as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'approved') as new_users_30d,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'approved') as new_users_7d,
        (SELECT COUNT(*) FROM hikes) as total_hikes,
        (SELECT COUNT(*) FROM hikes WHERE date >= CURRENT_DATE) as upcoming_hikes,
        (SELECT COUNT(*) FROM hikes WHERE date < CURRENT_DATE) as past_hikes,
        (SELECT COUNT(*) FROM hikes WHERE status = 'cancelled') as cancelled_hikes,
        (SELECT COUNT(DISTINCT user_id) FROM hike_interest
         WHERE created_at > NOW() - INTERVAL '30 days') as active_users_30d,
        (SELECT SUM(cost) FROM hikes WHERE status = 'trip_booked' AND date < CURRENT_DATE) as total_revenue,
        (SELECT COUNT(*) FROM hike_comments) as total_comments,
        0 as total_photos
    `;

    const result = await pool.query(overviewQuery);
    const overview = result.rows[0];

    // Convert to numbers
    Object.keys(overview).forEach(key => {
      if (overview[key] !== null) {
        overview[key] = key === 'total_revenue'
          ? parseFloat(overview[key]) || 0
          : parseInt(overview[key]) || 0;
      }
    });

    // Calculate additional metrics
    overview.user_growth_rate = overview.total_users > 0
      ? Math.round((overview.new_users_30d / overview.total_users) * 100)
      : 0;

    overview.hike_completion_rate = overview.total_hikes > 0
      ? Math.round((overview.past_hikes / overview.total_hikes) * 100)
      : 0;

    // Cache the result
    analyticsCache.overview = { data: overview, timestamp: Date.now() };

    res.json(overview);
  } catch (err) {
    console.error('Get analytics overview error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    // Check cache
    if (isCacheValid(analyticsCache.users)) {
      return res.json(analyticsCache.users.data);
    }

    // User growth over time (last 12 months)
    const userGrowthQuery = `
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
        AND status = 'approved'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    const growthResult = await pool.query(userGrowthQuery);

    // User activity levels
    const activityQuery = `
      SELECT
        COUNT(DISTINCT CASE WHEN hi.created_at > NOW() - INTERVAL '7 days' THEN hi.user_id END) as active_7d,
        COUNT(DISTINCT CASE WHEN hi.created_at > NOW() - INTERVAL '30 days' THEN hi.user_id END) as active_30d,
        COUNT(DISTINCT CASE WHEN hi.created_at > NOW() - INTERVAL '90 days' THEN hi.user_id END) as active_90d,
        COUNT(DISTINCT hi.user_id) as total_engaged
      FROM hike_interest hi
    `;

    const activityResult = await pool.query(activityQuery);

    // Top participants
    const topParticipantsQuery = `
      SELECT
        u.id,
        u.name,
        u.profile_photo_url,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.hike_id END) as hikes_confirmed,
        COUNT(DISTINCT hi.hike_id) as total_interactions
      FROM users u
      JOIN hike_interest hi ON u.id = hi.user_id
      WHERE u.status = 'approved'
      GROUP BY u.id, u.name, u.profile_photo_url
      ORDER BY hikes_confirmed DESC
      LIMIT 10
    `;

    const topParticipantsResult = await pool.query(topParticipantsQuery);

    const userAnalytics = {
      growth: growthResult.rows.map(row => ({
        month: row.month,
        new_users: parseInt(row.new_users),
        cumulative_users: parseInt(row.cumulative_users)
      })),
      activity: {
        active_7d: parseInt(activityResult.rows[0].active_7d) || 0,
        active_30d: parseInt(activityResult.rows[0].active_30d) || 0,
        active_90d: parseInt(activityResult.rows[0].active_90d) || 0,
        total_engaged: parseInt(activityResult.rows[0].total_engaged) || 0
      },
      topParticipants: topParticipantsResult.rows.map(row => ({
        ...row,
        hikes_confirmed: parseInt(row.hikes_confirmed),
        total_interactions: parseInt(row.total_interactions)
      }))
    };

    // Cache the result
    analyticsCache.users = { data: userAnalytics, timestamp: Date.now() };

    res.json(userAnalytics);
  } catch (err) {
    console.error('Get user analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

// Get hike analytics
exports.getHikeAnalytics = async (req, res) => {
  try {
    // Check cache
    if (isCacheValid(analyticsCache.hikes)) {
      return res.json(analyticsCache.hikes.data);
    }

    // Hikes by difficulty
    const difficultyQuery = `
      SELECT
        difficulty,
        COUNT(*) as count
      FROM hikes
      GROUP BY difficulty
      ORDER BY count DESC
    `;

    const difficultyResult = await pool.query(difficultyQuery);

    // Hikes by type
    const typeQuery = `
      SELECT
        type,
        COUNT(*) as count
      FROM hikes
      GROUP BY type
    `;

    const typeResult = await pool.query(typeQuery);

    // Hikes by status
    const statusQuery = `
      SELECT
        status,
        COUNT(*) as count
      FROM hikes
      GROUP BY status
      ORDER BY count DESC
    `;

    const statusResult = await pool.query(statusQuery);

    // Average attendance
    const attendanceQuery = `
      SELECT
        AVG(confirmed_count) as avg_confirmed,
        AVG(interested_count) as avg_interested
      FROM (
        SELECT
          h.id,
          COUNT(CASE WHEN hi.attendance_status = 'confirmed' THEN 1 END) as confirmed_count,
          COUNT(CASE WHEN hi.attendance_status = 'interested' THEN 1 END) as interested_count
        FROM hikes h
        LEFT JOIN hike_interest hi ON h.id = hi.hike_id
        GROUP BY h.id
      ) subquery
    `;

    const attendanceResult = await pool.query(attendanceQuery);

    // Monthly hike trends (last 12 months)
    const trendsQuery = `
      SELECT
        DATE_TRUNC('month', date) as month,
        COUNT(*) as hike_count,
        SUM(cost) as total_cost
      FROM hikes
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month
    `;

    const trendsResult = await pool.query(trendsQuery);

    const hikeAnalytics = {
      byDifficulty: difficultyResult.rows.map(row => ({
        difficulty: row.difficulty,
        count: parseInt(row.count)
      })),
      byType: typeResult.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count)
      })),
      byStatus: statusResult.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      })),
      attendance: {
        avg_confirmed: parseFloat(attendanceResult.rows[0].avg_confirmed) || 0,
        avg_interested: parseFloat(attendanceResult.rows[0].avg_interested) || 0
      },
      trends: trendsResult.rows.map(row => ({
        month: row.month,
        hike_count: parseInt(row.hike_count),
        total_cost: parseFloat(row.total_cost) || 0
      }))
    };

    // Cache the result
    analyticsCache.hikes = { data: hikeAnalytics, timestamp: Date.now() };

    res.json(hikeAnalytics);
  } catch (err) {
    console.error('Get hike analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch hike analytics' });
  }
};

// Get engagement metrics
exports.getEngagementMetrics = async (req, res) => {
  try {
    const engagementQuery = `
      SELECT
        (SELECT COUNT(*) FROM hike_comments) as total_comments,
        0 as total_photos,
        (SELECT AVG(comment_count) FROM (
          SELECT COUNT(*) as comment_count
          FROM hike_comments
          GROUP BY hike_id
        ) subquery) as avg_comments_per_hike,
        (SELECT COUNT(DISTINCT hc.user_id) FROM hike_comments hc) as users_who_commented,
        0 as users_who_uploaded_photos
    `;

    const result = await pool.query(engagementQuery);
    const engagement = result.rows[0];

    // Convert to numbers
    engagement.total_comments = parseInt(engagement.total_comments) || 0;
    engagement.total_photos = parseInt(engagement.total_photos) || 0;
    engagement.avg_comments_per_hike = parseFloat(engagement.avg_comments_per_hike) || 0;
    engagement.users_who_commented = parseInt(engagement.users_who_commented) || 0;
    engagement.users_who_uploaded_photos = parseInt(engagement.users_who_uploaded_photos) || 0;

    // Interest to confirmation conversion rate
    const conversionQuery = `
      SELECT
        COUNT(CASE WHEN attendance_status = 'interested' THEN 1 END) as interested_count,
        COUNT(CASE WHEN attendance_status = 'confirmed' THEN 1 END) as confirmed_count
      FROM hike_interest
    `;

    const conversionResult = await pool.query(conversionQuery);
    const interested = parseInt(conversionResult.rows[0].interested_count) || 0;
    const confirmed = parseInt(conversionResult.rows[0].confirmed_count) || 0;

    engagement.conversion_rate = interested > 0
      ? Math.round((confirmed / (interested + confirmed)) * 100)
      : 0;

    res.json(engagement);
  } catch (err) {
    console.error('Get engagement metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch engagement metrics' });
  }
};

// Clear analytics cache (for admin use after data changes)
exports.clearCache = (req, res) => {
  analyticsCache = {
    overview: { data: null, timestamp: null },
    users: { data: null, timestamp: null },
    hikes: { data: null, timestamp: null }
  };
  res.json({ success: true, message: 'Analytics cache cleared' });
};

module.exports = exports;
