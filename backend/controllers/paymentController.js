// controllers/paymentController.js - Payment tracking controller
const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Get payments for a specific hike
exports.getHikePayments = async (req, res) => {
  try {
    const { hikeId } = req.params;

    const result = await pool.query(
      `SELECT hp.*,
              u.name as user_name,
              u.email as user_email,
              admin.name as recorded_by_name
       FROM hike_payments hp
       JOIN users u ON hp.user_id = u.id
       LEFT JOIN users admin ON hp.created_by = admin.id
       WHERE hp.hike_id = $1
       ORDER BY hp.created_at DESC`,
      [hikeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get hike payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get all payments (Admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, hikeId, userId } = req.query;

    let query = `
      SELECT hp.*,
             u.name as user_name,
             u.email as user_email,
             h.name as hike_name,
             h.date as hike_date,
             admin.name as recorded_by_name
      FROM hike_payments hp
      JOIN users u ON hp.user_id = u.id
      JOIN hikes h ON hp.hike_id = h.id
      LEFT JOIN users admin ON hp.created_by = admin.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND hp.payment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (hikeId) {
      query += ` AND hp.hike_id = $${paramIndex}`;
      params.push(hikeId);
      paramIndex++;
    }

    if (userId) {
      query += ` AND hp.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    query += ` ORDER BY hp.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get payment statistics for a hike
exports.getHikePaymentStats = async (req, res) => {
  try {
    const { hikeId } = req.params;

    const result = await pool.query(
      `SELECT
        h.cost as hike_cost,
        COUNT(hp.id) as total_payments,
        COUNT(CASE WHEN hp.payment_status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN hp.payment_status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN hp.payment_status = 'refunded' THEN 1 END) as refunded_count,
        COALESCE(SUM(CASE WHEN hp.payment_status = 'paid' THEN hp.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN hp.payment_status = 'pending' THEN hp.amount ELSE 0 END), 0) as total_pending,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.user_id END) as confirmed_attendees
      FROM hikes h
      LEFT JOIN hike_payments hp ON h.id = hp.hike_id
      LEFT JOIN hike_interest hi ON h.id = hi.hike_id
      WHERE h.id = $1
      GROUP BY h.id, h.cost`,
      [hikeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    const stats = result.rows[0];

    // Calculate expected total
    stats.expected_total = parseFloat(stats.hike_cost || 0) * parseInt(stats.confirmed_attendees || 0);
    stats.total_paid = parseFloat(stats.total_paid);
    stats.total_pending = parseFloat(stats.total_pending);
    stats.outstanding = stats.expected_total - stats.total_paid;

    res.json(stats);
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};

// Create or update payment record
exports.recordPayment = async (req, res) => {
  try {
    const { hikeId, userId, amount, paymentMethod, paymentStatus, paymentDate, notes } = req.body;

    if (!hikeId || !userId || !amount) {
      return res.status(400).json({ error: 'Hike ID, User ID, and amount are required' });
    }

    // Check if payment record already exists
    const existingPayment = await pool.query(
      'SELECT id FROM hike_payments WHERE hike_id = $1 AND user_id = $2',
      [hikeId, userId]
    );

    let result;
    if (existingPayment.rows.length > 0) {
      // Update existing payment
      result = await pool.query(
        `UPDATE hike_payments
         SET amount = $1,
             payment_method = $2,
             payment_status = $3,
             payment_date = $4,
             notes = $5,
             updated_at = NOW()
         WHERE hike_id = $6 AND user_id = $7
         RETURNING *`,
        [amount, paymentMethod, paymentStatus, paymentDate, notes, hikeId, userId]
      );
    } else {
      // Create new payment
      result = await pool.query(
        `INSERT INTO hike_payments (hike_id, user_id, amount, payment_method, payment_status, payment_date, notes, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [hikeId, userId, amount, paymentMethod, paymentStatus, paymentDate, notes, req.user.id]
      );
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'record_payment',
      'payment',
      result.rows[0].id,
      JSON.stringify({ hikeId, userId, amount, status: paymentStatus }),
      ipAddress
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Delete payment record
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM hike_payments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'delete_payment',
      'payment',
      id,
      JSON.stringify(result.rows[0]),
      ipAddress
    );

    res.json({ success: true, message: 'Payment record deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

// Bulk create payment records for confirmed attendees
exports.bulkCreatePayments = async (req, res) => {
  try {
    const { hikeId } = req.params;
    const { amount, paymentStatus = 'pending' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Get confirmed attendees who don't have payment records yet
    const attendeesResult = await pool.query(
      `SELECT DISTINCT hi.user_id
       FROM hike_interest hi
       WHERE hi.hike_id = $1
         AND hi.attendance_status = 'confirmed'
         AND NOT EXISTS (
           SELECT 1 FROM hike_payments hp
           WHERE hp.hike_id = hi.hike_id AND hp.user_id = hi.user_id
         )`,
      [hikeId]
    );

    if (attendeesResult.rows.length === 0) {
      return res.json({ success: true, created: 0, message: 'No new attendees to create payment records for' });
    }

    // Create payment records for each attendee
    const insertPromises = attendeesResult.rows.map(row =>
      pool.query(
        `INSERT INTO hike_payments (hike_id, user_id, amount, payment_status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [hikeId, row.user_id, amount, paymentStatus, req.user.id]
      )
    );

    await Promise.all(insertPromises);

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'bulk_create_payments',
      'payment',
      hikeId,
      JSON.stringify({ count: attendeesResult.rows.length, amount, status: paymentStatus }),
      ipAddress
    );

    res.json({
      success: true,
      created: attendeesResult.rows.length,
      message: `Created ${attendeesResult.rows.length} payment record(s)`
    });
  } catch (error) {
    console.error('Bulk create payments error:', error);
    res.status(500).json({ error: 'Failed to create payment records' });
  }
};

module.exports = exports;
