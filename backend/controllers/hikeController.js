// controllers/hikeController.js - Hike controller
const pool = require('../config/database');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');
const { logActivity } = require('../utils/activityLogger');
const emailTemplates = require('../services/emailTemplates');

// Get all public hikes (no auth required)
exports.getPublicHikes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        h.id, h.name, h.date, h.difficulty, h.distance, h.description, h.type, h.cost,
        h.group_type, h.status, h.image_url, h.gps_coordinates, h.price_is_estimate,
        h.date_is_estimate, h.event_type, h.event_type_data, h.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug,
              'category', t.category,
              'color', t.color,
              'icon', t.icon
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        COUNT(DISTINCT CASE WHEN hi.attendance_status IN ('interested', 'confirmed') THEN hi.user_id END) as interested_count,
        COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.user_id END) as confirmed_count
       FROM hikes h
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       LEFT JOIN hike_interest hi ON h.id = hi.hike_id
       WHERE h.date >= CURRENT_DATE
       GROUP BY h.id
       ORDER BY h.date ASC
       LIMIT 12`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get public hikes error:', error);
    res.status(500).json({ error: 'Failed to fetch hikes' });
  }
};

// Get single hike by ID (public for sharing)
exports.getHikeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT h.*,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', t.id,
             'name', t.name,
             'slug', t.slug,
             'category', t.category,
             'color', t.color,
             'icon', t.icon
           )
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) as tags,
       COUNT(DISTINCT CASE WHEN hi.attendance_status = 'interested' THEN hi.user_id END) as interested_count,
       COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.user_id END) as confirmed_count
       FROM hikes h
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       LEFT JOIN hike_interest hi ON h.id = hi.hike_id
       WHERE h.id = $1
       GROUP BY h.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get hike by ID error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to fetch hike details', details: error.message });
  }
};

// Get all hikes (authenticated)
// Updated to use attendance_status from hike_interest table
exports.getHikes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', t.id,
             'name', t.name,
             'slug', t.slug,
             'category', t.category,
             'color', t.color,
             'icon', t.icon
           )
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) as tags,
       COALESCE(json_agg(DISTINCT hi.user_id) FILTER (WHERE hi.attendance_status IN ('interested', 'confirmed')), '[]') as interested_users,
       COALESCE(json_agg(DISTINCT hi.user_id) FILTER (WHERE hi.attendance_status = 'confirmed'), '[]') as confirmed_users
       FROM hikes h
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       LEFT JOIN hike_interest hi ON h.id = hi.hike_id
       GROUP BY h.id
       ORDER BY h.date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get hikes error:', error);
    res.status(500).json({ error: 'Failed to fetch hikes' });
  }
};

// Create hike (Admin only)
exports.createHike = async (req, res) => {
  try {
    const {
      name, date, location, description, cost, status,
      image_url, price_is_estimate, date_is_estimate,
      location_link, destination_website, gps_coordinates,
      event_type, event_type_data,
      registration_deadline, payment_deadline, registration_closed, pay_at_venue,
      // Old fields for backward compatibility
      difficulty, distance, type, group_type
    } = req.body;

    // Convert datetime-local format (YYYY-MM-DDTHH:MM) to PostgreSQL TIMESTAMP format (YYYY-MM-DDTHH:MM:SS)
    // datetime-local inputs don't include seconds, but PostgreSQL TIMESTAMP requires them
    const regDeadlineValue = registration_deadline && registration_deadline.length === 16
      ? registration_deadline + ':00'
      : registration_deadline || null;
    const payDeadlineValue = payment_deadline && payment_deadline.length === 16
      ? payment_deadline + ':00'
      : payment_deadline || null;

    const result = await pool.query(
      `INSERT INTO hikes (
        name, date, location, description, cost, status,
        image_url, price_is_estimate, date_is_estimate,
        location_link, destination_website, gps_coordinates,
        event_type, event_type_data,
        registration_deadline, payment_deadline, registration_closed, pay_at_venue,
        difficulty, distance, type, group_type,
        created_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
       RETURNING *`,
      [
        name, date, location, description, cost, status || 'gathering_interest',
        image_url, price_is_estimate || false, date_is_estimate || false,
        location_link, destination_website, gps_coordinates,
        event_type || 'hiking', event_type_data ? JSON.stringify(event_type_data) : '{}',
        regDeadlineValue, payDeadlineValue,
        registration_closed === true, pay_at_venue === true,
        // Provide defaults for old required fields
        difficulty || 'Moderate', distance || 'TBA', type || 'day', group_type || 'family'
      ]
    );

    const hike = result.rows[0];

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'create_hike', 'hike', hike.id, JSON.stringify({ name, date, event_type }), ipAddress);

    // Send notifications asynchronously (non-blocking) - PERFORMANCE OPTIMIZATION
    (async () => {
      try {
        const users = await pool.query(
          'SELECT id, email, phone, notifications_email, notifications_whatsapp, name FROM users WHERE status = $1',
          ['approved']
        );

        const hikeDate = new Date(date).toLocaleDateString();
        const eventTypeName = event_type || 'hiking';

        // Send all notifications in parallel
        await Promise.all(
          users.rows.map(async (user) => {
            const promises = [];

            if (user.notifications_email) {
              promises.push(
                sendEmail(
                  user.email,
                  'New Event Added!',
                  emailTemplates.newHikeEmail(name, hikeDate, eventTypeName, '', description, cost, 'all'),
                  user.id,
                  'new_hike'
                )
              );
            }

            if (user.notifications_whatsapp) {
              promises.push(
                sendWhatsApp(
                  user.phone,
                  `New ${eventTypeName} event: ${name} on ${hikeDate}. ${cost > 0 ? `Cost: R${cost}` : 'Free'}`,
                  user.id,
                  'new_hike'
                )
              );
            }

            return Promise.all(promises);
          })
        );

        console.log(`Notifications sent for event: ${name}`);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    })();

    res.status(201).json(hike);
  } catch (error) {
    console.error('Create event error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
};

// Update hike (Admin only)
exports.updateHike = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, date, location, description, cost, status,
      image_url, price_is_estimate, date_is_estimate,
      location_link, destination_website, gps_coordinates,
      event_type, event_type_data,
      registration_deadline, payment_deadline, registration_closed, pay_at_venue,
      // Old fields for backward compatibility
      difficulty, distance, type, group_type
    } = req.body;

    // Convert datetime-local format (YYYY-MM-DDTHH:MM) to PostgreSQL TIMESTAMP format (YYYY-MM-DDTHH:MM:SS)
    // datetime-local inputs don't include seconds, but PostgreSQL TIMESTAMP requires them
    const regDeadlineValue = registration_deadline && registration_deadline.length === 16
      ? registration_deadline + ':00'
      : registration_deadline || null;
    const payDeadlineValue = payment_deadline && payment_deadline.length === 16
      ? payment_deadline + ':00'
      : payment_deadline || null;

    const result = await pool.query(
      `UPDATE hikes
       SET name = $1, date = $2, location = $3, description = $4, cost = $5, status = $6,
           image_url = $7, price_is_estimate = $8, date_is_estimate = $9,
           location_link = $10, destination_website = $11, gps_coordinates = $12,
           event_type = $13, event_type_data = $14,
           registration_deadline = $15, payment_deadline = $16, registration_closed = $17, pay_at_venue = $18,
           difficulty = $19, distance = $20, type = $21, group_type = $22
       WHERE id = $23
       RETURNING *`,
      [
        name, date, location, description, cost, status || 'gathering_interest',
        image_url, price_is_estimate || false, date_is_estimate || false,
        location_link, destination_website, gps_coordinates,
        event_type || 'hiking', event_type_data ? JSON.stringify(event_type_data) : '{}',
        regDeadlineValue, payDeadlineValue,
        registration_closed === true, pay_at_venue === true,
        // Provide defaults for old required fields
        difficulty || 'Moderate', distance || 'TBA', type || 'day', group_type || 'family',
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'update_hike', 'hike', id, JSON.stringify({ name, date, status, event_type }), ipAddress);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update event error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to update event', details: error.message });
  }
};

// Delete hike (Admin only)
exports.deleteHike = async (req, res) => {
  try {
    const { id } = req.params;

    // Get hike name before deleting for logging
    const hikeResult = await pool.query('SELECT name FROM hikes WHERE id = $1', [id]);
    const hikeName = hikeResult.rows[0]?.name;

    await pool.query('DELETE FROM hikes WHERE id = $1', [id]);

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(req.user.id, 'delete_hike', 'hike', id, hikeName, ipAddress);

    res.json({ message: 'Hike deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get interested users for a hike (Admin only)
exports.getInterestedUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id as user_id, u.name, u.email, u.phone, hi.created_at, hi.attendance_status
       FROM hike_interest hi
       JOIN users u ON hi.user_id = u.id
       WHERE hi.hike_id = $1 AND hi.attendance_status = 'interested'
       ORDER BY hi.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get interested users error:', error);
    res.status(500).json({ error: 'Failed to fetch interested users' });
  }
};

// Get attendees for a hike (Admin only)
// Updated to use hike_interest with attendance_status='confirmed'
exports.getAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT hi.hike_id, hi.user_id, hi.payment_status, hi.amount_paid,
              hi.created_at, hi.updated_at, u.name, u.email, u.phone
       FROM hike_interest hi
       JOIN users u ON hi.user_id = u.id
       WHERE hi.hike_id = $1 AND hi.attendance_status = 'confirmed'
       ORDER BY hi.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
};

// Add attendee to hike (Admin only)
// Updated to use hike_interest with attendance_status='confirmed'
exports.addAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, payment_status, amount_paid, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO hike_interest (hike_id, user_id, attendance_status, payment_status, amount_paid, created_at, updated_at)
       VALUES ($1, $2, 'confirmed', $3, $4, NOW(), NOW())
       ON CONFLICT (hike_id, user_id) DO UPDATE
       SET attendance_status = 'confirmed', payment_status = $3, amount_paid = $4, updated_at = NOW()
       RETURNING *`,
      [id, user_id, payment_status || 'pending', amount_paid || 0]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json({ error: 'Failed to add attendee' });
  }
};

// Update attendee (Admin only)
// Updated to use hike_interest table
exports.updateAttendee = async (req, res) => {
  try {
    const { hikeId, userId } = req.params;
    const { payment_status, amount_paid } = req.body;

    const result = await pool.query(
      `UPDATE hike_interest
       SET payment_status = $1, amount_paid = $2, updated_at = NOW()
       WHERE hike_id = $3 AND user_id = $4 AND attendance_status = 'confirmed'
       RETURNING *`,
      [payment_status, amount_paid, hikeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Confirmed attendee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update attendee error:', error);
    res.status(500).json({ error: 'Failed to update attendee' });
  }
};

// Remove attendee (Admin only)
// Updated to use hike_interest - changes status to 'cancelled' instead of deleting
exports.removeAttendee = async (req, res) => {
  try {
    const { hikeId, userId } = req.params;
    const result = await pool.query(
      `UPDATE hike_interest
       SET attendance_status = 'cancelled', updated_at = NOW()
       WHERE hike_id = $1 AND user_id = $2 AND attendance_status = 'confirmed'
       RETURNING *`,
      [hikeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Confirmed attendee not found' });
    }

    res.json({ message: 'Attendee removed' });
  } catch (error) {
    console.error('Remove attendee error:', error);
    res.status(500).json({ error: 'Failed to remove attendee' });
  }
};

// Get hike details for current user (includes interest and attendance status)
// Updated to use hike_interest.attendance_status instead of separate hike_attendees table
exports.getMyHikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [hikeResult, interestResult, interestedCount, confirmedCount] = await Promise.all([
      pool.query('SELECT * FROM hikes WHERE id = $1', [id]),
      pool.query('SELECT * FROM hike_interest WHERE hike_id = $1 AND user_id = $2', [id, userId]),
      pool.query('SELECT COUNT(*) as count FROM hike_interest WHERE hike_id = $1', [id]),
      pool.query('SELECT COUNT(*) as count FROM hike_interest WHERE hike_id = $1 AND attendance_status = $2', [id, 'confirmed'])
    ]);

    if (hikeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    const interestRecord = interestResult.rows[0];
    const attendanceStatus = interestRecord?.attendance_status || null;

    res.json({
      hike: hikeResult.rows[0],
      isInterested: interestRecord && (attendanceStatus === 'interested' || attendanceStatus === 'confirmed'),
      isConfirmed: attendanceStatus === 'confirmed',
      attendance_status: attendanceStatus,
      interestInfo: interestRecord || null,
      interestedCount: parseInt(interestedCount.rows[0].count),
      confirmedCount: parseInt(confirmedCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get hike status error:', error);
    res.status(500).json({ error: 'Failed to fetch hike status' });
  }
};

// Get comments for a hike
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name as user_name
       FROM hike_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.hike_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Add comment to hike
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const result = await pool.query(
      `INSERT INTO hike_comments (hike_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [id, userId, comment.trim()]
    );

    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const response = {
      ...result.rows[0],
      user_name: userResult.rows[0].name
    };

    res.json(response);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await pool.query(
      'SELECT user_id FROM hike_comments WHERE id = $1',
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('DELETE FROM hike_comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Get carpool offers for a hike
exports.getCarpoolOffers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name as driver_name, u.phone as driver_phone
       FROM carpool_offers c
       JOIN users u ON c.user_id = u.id
       WHERE c.hike_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get carpool offers error:', error);
    res.status(500).json({ error: 'Failed to fetch carpool offers' });
  }
};

// Create carpool offer
exports.createCarpoolOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      departure_location, available_seats, departure_time, notes,
      estimated_distance_km, fuel_cost_per_liter, vehicle_consumption,
      contact_phone, contact_email
    } = req.body;
    const userId = req.user.id;

    if (!departure_location || available_seats === undefined) {
      return res.status(400).json({ error: 'Departure location and available seats are required' });
    }

    // Calculate estimated cost per person if distance and fuel details provided
    let estimated_cost_per_person = null;
    if (estimated_distance_km && fuel_cost_per_liter && vehicle_consumption) {
      const fuelCost = (estimated_distance_km / 100) * vehicle_consumption * fuel_cost_per_liter;
      estimated_cost_per_person = fuelCost / (available_seats + 1); // +1 for driver
    }

    const result = await pool.query(
      `INSERT INTO carpool_offers (
        hike_id, user_id, departure_location, available_seats, departure_time, notes,
        estimated_distance_km, fuel_cost_per_liter, vehicle_consumption, estimated_cost_per_person,
        contact_phone, contact_email, created_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [
        id, userId, departure_location, available_seats, departure_time, notes,
        estimated_distance_km, fuel_cost_per_liter, vehicle_consumption, estimated_cost_per_person,
        contact_phone, contact_email
      ]
    );

    const userResult = await pool.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    res.json({
      success: true,
      offer: {
        ...result.rows[0],
        driver_name: userResult.rows[0].name,
        driver_phone: userResult.rows[0].phone
      }
    });
  } catch (error) {
    console.error('Create carpool offer error:', error);
    res.status(500).json({ error: 'Failed to create carpool offer' });
  }
};

// Update carpool offer
exports.updateCarpoolOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const {
      departure_location, available_seats, departure_time, notes,
      estimated_distance_km, fuel_cost_per_liter, vehicle_consumption,
      contact_phone, contact_email
    } = req.body;
    const userId = req.user.id;

    // Check if offer exists and user owns it
    const offer = await pool.query(
      'SELECT user_id FROM carpool_offers WHERE id = $1',
      [offerId]
    );

    if (offer.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!departure_location || available_seats === undefined) {
      return res.status(400).json({ error: 'Departure location and available seats are required' });
    }

    // Calculate estimated cost per person if distance and fuel details provided
    let estimated_cost_per_person = null;
    if (estimated_distance_km && fuel_cost_per_liter && vehicle_consumption) {
      const fuelCost = (estimated_distance_km / 100) * vehicle_consumption * fuel_cost_per_liter;
      estimated_cost_per_person = fuelCost / (available_seats + 1); // +1 for driver
    }

    const result = await pool.query(
      `UPDATE carpool_offers
       SET departure_location = $1, available_seats = $2, departure_time = $3,
           notes = $4, estimated_distance_km = $5, fuel_cost_per_liter = $6,
           vehicle_consumption = $7, estimated_cost_per_person = $8,
           contact_phone = $9, contact_email = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        departure_location, available_seats, departure_time, notes,
        estimated_distance_km, fuel_cost_per_liter, vehicle_consumption,
        estimated_cost_per_person, contact_phone, contact_email, offerId
      ]
    );

    const userResult = await pool.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    res.json({
      success: true,
      offer: {
        ...result.rows[0],
        driver_name: userResult.rows[0].name,
        driver_phone: userResult.rows[0].phone
      }
    });
  } catch (error) {
    console.error('Update carpool offer error:', error);
    res.status(500).json({ error: 'Failed to update carpool offer' });
  }
};

// Delete carpool offer
exports.deleteCarpoolOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;

    const offer = await pool.query(
      'SELECT user_id FROM carpool_offers WHERE id = $1',
      [offerId]
    );

    if (offer.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('DELETE FROM carpool_offers WHERE id = $1', [offerId]);
    res.json({ message: 'Carpool offer deleted' });
  } catch (error) {
    console.error('Delete carpool offer error:', error);
    res.status(500).json({ error: 'Failed to delete carpool offer' });
  }
};

// Get carpool requests for a hike
exports.getCarpoolRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name as requester_name, u.phone as requester_phone
       FROM carpool_requests c
       JOIN users u ON c.user_id = u.id
       WHERE c.hike_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get carpool requests error:', error);
    res.status(500).json({ error: 'Failed to fetch carpool requests' });
  }
};

// Create/update carpool request
exports.createCarpoolRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickup_location, notes, contact_phone, contact_email } = req.body;
    const userId = req.user.id;

    if (!pickup_location) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }

    const result = await pool.query(
      `INSERT INTO carpool_requests (hike_id, user_id, pickup_location, notes, contact_phone, contact_email, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (hike_id, user_id) DO UPDATE
       SET pickup_location = $3, notes = $4, contact_phone = $5, contact_email = $6
       RETURNING *`,
      [id, userId, pickup_location, notes, contact_phone, contact_email]
    );

    const userResult = await pool.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
    res.json({
      success: true,
      request: {
        ...result.rows[0],
        requester_name: userResult.rows[0].name,
        requester_phone: userResult.rows[0].phone
      }
    });
  } catch (error) {
    console.error('Create carpool request error:', error);
    res.status(500).json({ error: 'Failed to create carpool request' });
  }
};

// Delete carpool request
exports.deleteCarpoolRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await pool.query(
      'SELECT user_id FROM carpool_requests WHERE id = $1',
      [requestId]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('DELETE FROM carpool_requests WHERE id = $1', [requestId]);
    res.json({ message: 'Carpool request deleted' });
  } catch (error) {
    console.error('Delete carpool request error:', error);
    res.status(500).json({ error: 'Failed to delete carpool request' });
  }
};

// Get packing list for user and hike
exports.getPackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM packing_lists WHERE hike_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      // Get hike's custom default list or use template defaults
      const hikeResult = await pool.query('SELECT type, default_packing_list FROM hikes WHERE id = $1', [id]);
      const hike = hikeResult.rows[0];

      let defaultItems;

      // If hike has custom default list, use it
      if (hike?.default_packing_list && Array.isArray(hike.default_packing_list)) {
        defaultItems = hike.default_packing_list.map(item => ({ ...item, checked: false }));
      } else {
        // Use template defaults based on hike type
        const isMultiDay = hike?.type === 'multi';
        defaultItems = isMultiDay ? [
          { name: 'Backpack', checked: false },
          { name: 'Sleeping bag', checked: false },
          { name: 'Tent', checked: false },
          { name: 'Water (2L)', checked: false },
          { name: 'Food/snacks', checked: false },
          { name: 'First aid kit', checked: false },
          { name: 'Sunscreen', checked: false },
          { name: 'Hat', checked: false },
          { name: 'Hiking boots', checked: false },
          { name: 'Rain jacket', checked: false },
          { name: 'Warm clothes', checked: false },
          { name: 'Headlamp', checked: false },
          { name: 'Map/GPS', checked: false }
        ] : [
          { name: 'Daypack', checked: false },
          { name: 'Water (1L)', checked: false },
          { name: 'Snacks', checked: false },
          { name: 'Sunscreen', checked: false },
          { name: 'Hat', checked: false },
          { name: 'Hiking shoes', checked: false },
          { name: 'Rain jacket', checked: false }
        ];
      }

      return res.json({ items: defaultItems });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get packing list error:', error);
    res.status(500).json({ error: 'Failed to fetch packing list' });
  }
};

// Update packing list
exports.updatePackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO packing_lists (hike_id, user_id, items, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (hike_id, user_id) DO UPDATE
       SET items = $3, updated_at = NOW()
       RETURNING *`,
      [id, userId, JSON.stringify(items)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update packing list error:', error);
    res.status(500).json({ error: 'Failed to update packing list' });
  }
};

// Get default packing list for hike (Admin only)
exports.getDefaultPackingList = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT type, default_packing_list FROM hikes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    const hike = result.rows[0];

    // If no custom list, return template defaults
    if (!hike.default_packing_list) {
      const isMultiDay = hike.type === 'multi';
      const templateDefaults = isMultiDay ? [
        { name: 'Backpack' },
        { name: 'Sleeping bag' },
        { name: 'Tent' },
        { name: 'Water (2L)' },
        { name: 'Food/snacks' },
        { name: 'First aid kit' },
        { name: 'Sunscreen' },
        { name: 'Hat' },
        { name: 'Hiking boots' },
        { name: 'Rain jacket' },
        { name: 'Warm clothes' },
        { name: 'Headlamp' },
        { name: 'Map/GPS' }
      ] : [
        { name: 'Daypack' },
        { name: 'Water (1L)' },
        { name: 'Snacks' },
        { name: 'Sunscreen' },
        { name: 'Hat' },
        { name: 'Hiking shoes' },
        { name: 'Rain jacket' }
      ];

      return res.json({ items: templateDefaults, isTemplate: true });
    }

    res.json({ items: hike.default_packing_list, isTemplate: false });
  } catch (error) {
    console.error('Get default packing list error:', error);
    res.status(500).json({ error: 'Failed to fetch default packing list' });
  }
};

// Update default packing list for hike (Admin only)
exports.updateDefaultPackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    const result = await pool.query(
      `UPDATE hikes
       SET default_packing_list = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(items), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update default packing list error:', error);
    res.status(500).json({ error: 'Failed to update default packing list' });
  }
};

// Get user's hikes dashboard
// Updated to use hike_interest.attendance_status
exports.getMyHikes = async (req, res) => {
  try {
    const userId = req.user.id;

    const interested = await pool.query(
      `SELECT h.*,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', t.id,
                    'name', t.name,
                    'slug', t.slug,
                    'category', t.category,
                    'color', t.color,
                    'icon', t.icon
                  )
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'
              ) as tags,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id AND attendance_status IN ('interested', 'confirmed')) as interested_count,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id AND attendance_status = 'confirmed') as confirmed_count
       FROM hikes h
       JOIN hike_interest i ON h.id = i.hike_id
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE i.user_id = $1 AND i.attendance_status = 'interested' AND h.date >= CURRENT_DATE
       GROUP BY h.id, i.payment_status, i.amount_paid
       ORDER BY h.date ASC`,
      [userId]
    );

    const confirmed = await pool.query(
      `SELECT h.*, i.payment_status, i.amount_paid,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', t.id,
                    'name', t.name,
                    'slug', t.slug,
                    'category', t.category,
                    'color', t.color,
                    'icon', t.icon
                  )
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'
              ) as tags,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id AND attendance_status IN ('interested', 'confirmed')) as interested_count,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id AND attendance_status = 'confirmed') as confirmed_count
       FROM hikes h
       JOIN hike_interest i ON h.id = i.hike_id
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE i.user_id = $1 AND i.attendance_status = 'confirmed' AND h.date >= CURRENT_DATE
       GROUP BY h.id, i.payment_status, i.amount_paid
       ORDER BY h.date ASC`,
      [userId]
    );

    const past = await pool.query(
      `SELECT h.*,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', t.id,
                    'name', t.name,
                    'slug', t.slug,
                    'category', t.category,
                    'color', t.color,
                    'icon', t.icon
                  )
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'
              ) as tags
       FROM hikes h
       JOIN hike_interest i ON h.id = i.hike_id
       LEFT JOIN event_tags et ON h.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE i.user_id = $1 AND i.attendance_status = 'attended' AND h.date < CURRENT_DATE
       GROUP BY h.id
       ORDER BY h.date DESC
       LIMIT 10`,
      [userId]
    );

    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_hikes,
        COUNT(CASE WHEN h.type = 'multi' THEN 1 END) as multi_day_hikes
       FROM hikes h
       JOIN hike_interest i ON h.id = i.hike_id
       WHERE i.user_id = $1 AND i.attendance_status = 'attended' AND h.date < CURRENT_DATE`,
      [userId]
    );

    res.json({
      interested: interested.rows,
      confirmed: confirmed.rows,
      past: past.rows,
      stats: stats.rows[0] || { total_hikes: 0, multi_day_hikes: 0 }
    });
  } catch (error) {
    console.error('Get my hikes error:', error);
    res.status(500).json({ error: 'Failed to fetch hikes' });
  }
};

// Get user's own emergency contact
exports.getEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT emergency_contact_name, emergency_contact_phone, medical_info FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get emergency contact error:', error);
    res.status(500).json({ error: 'Failed to get emergency contact' });
  }
};

// Update emergency contact info
exports.updateEmergencyContact = async (req, res) => {
  try {
    const { emergency_contact_name, emergency_contact_phone, medical_info } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE users
       SET emergency_contact_name = $1, emergency_contact_phone = $2, medical_info = $3
       WHERE id = $4
       RETURNING emergency_contact_name, emergency_contact_phone, medical_info`,
      [emergency_contact_name, emergency_contact_phone, medical_info, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ error: 'Failed to update emergency contact' });
  }
};

// Get emergency contacts for hike (Admin only)
// Updated to use hike_interest with attendance_status='confirmed'
exports.getHikeEmergencyContacts = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.name, u.phone, u.email, u.emergency_contact_name, u.emergency_contact_phone, u.medical_info
       FROM users u
       JOIN hike_interest i ON u.id = i.user_id
       WHERE i.hike_id = $1 AND i.attendance_status = 'confirmed'
       ORDER BY u.name ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
};

// Email hike attendees
exports.emailHikeAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get hike details
    const hikeResult = await pool.query(
      'SELECT name, date, event_type FROM hikes WHERE id = $1',
      [id]
    );

    if (hikeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hike not found' });
    }

    const hike = hikeResult.rows[0];
    const eventType = hike.event_type || 'hiking';

    // Get all confirmed attendees with email notifications enabled
    const attendeesResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.notifications_email
       FROM users u
       JOIN hike_interest i ON u.id = i.user_id
       WHERE i.hike_id = $1 AND i.attendance_status = 'confirmed'
       AND u.notifications_email = true`,
      [id]
    );

    const attendees = attendeesResult.rows;

    if (attendees.length === 0) {
      return res.status(400).json({ error: 'No confirmed attendees with email enabled found for this event' });
    }

    // Send email to each attendee
    const emailPromises = attendees.map(attendee => {
      const emailBody = emailTemplates.hikeAnnouncementEmail(
        attendee.name,
        hike.name,
        hike.date,
        subject,
        message,
        eventType
      );

      return sendEmail(
        attendee.email,
        subject,
        emailBody,
        attendee.id,
        'hike_announcement'
      ).catch(err => {
        console.error(`Failed to send email to ${attendee.email}:`, err);
        return { success: false, email: attendee.email, error: err.message };
      });
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success !== false).length;
    const failureCount = results.length - successCount;

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      req.user.id,
      'email_hike_attendees',
      'hike',
      id,
      JSON.stringify({ subject, recipientCount: attendees.length, successCount, failureCount }),
      ipAddress
    );

    res.json({
      success: true,
      message: `Email sent to ${successCount} attendee${successCount !== 1 ? 's' : ''}`,
      details: {
        total: attendees.length,
        success: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Email hike attendees error:', error);
    res.status(500).json({ error: 'Failed to send emails to attendees' });
  }
};
