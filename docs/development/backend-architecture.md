# Backend Endpoints to Add

This document contains all the backend endpoints that need to be added to `server.js` to support the new features.

## 1. Multi-Day Hike Fields

Update hike creation and editing endpoints to include:
- `image_url` (TEXT)
- `destination_url` (TEXT)
- `daily_distances` (JSONB) - array of {day: 1, distance: "10km", description: "..."}
- `overnight_facilities` (TEXT)

## 2. Hike Comments Endpoints

```javascript
// Get comments for a hike
app.get('/api/hikes/:id/comments', authenticateToken, async (req, res) => {
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
});

// Add comment to hike
app.post('/api/hikes/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const result = await pool.query(
      `INSERT INTO hike_comments (hike_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [id, userId, comment]
    );

    // Get user name
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
});

// Delete comment (user can delete their own, admin can delete any)
app.delete('/api/hikes/:hikeId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if user owns comment or is admin
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
});
```

## 3. Carpooling Endpoints

```javascript
// Get carpool offers for a hike
app.get('/api/hikes/:id/carpool-offers', authenticateToken, async (req, res) => {
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
});

// Create carpool offer
app.post('/api/hikes/:id/carpool-offers', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { departure_location, available_seats, departure_time, notes } = req.body;
    const userId = req.user.id;

    if (!departure_location || available_seats === undefined) {
      return res.status(400).json({ error: 'Departure location and available seats are required' });
    }

    const result = await pool.query(
      `INSERT INTO carpool_offers (hike_id, user_id, departure_location, available_seats, departure_time, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, userId, departure_location, available_seats, departure_time, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create carpool offer error:', error);
    res.status(500).json({ error: 'Failed to create carpool offer' });
  }
});

// Delete carpool offer
app.delete('/api/hikes/:hikeId/carpool-offers/:offerId', authenticateToken, async (req, res) => {
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
});

// Get carpool requests for a hike
app.get('/api/hikes/:id/carpool-requests', authenticateToken, async (req, res) => {
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
});

// Create carpool request
app.post('/api/hikes/:id/carpool-requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { pickup_location, notes } = req.body;
    const userId = req.user.id;

    if (!pickup_location) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }

    const result = await pool.query(
      `INSERT INTO carpool_requests (hike_id, user_id, pickup_location, notes, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (hike_id, user_id) DO UPDATE
       SET pickup_location = $3, notes = $4
       RETURNING *`,
      [id, userId, pickup_location, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create carpool request error:', error);
    res.status(500).json({ error: 'Failed to create carpool request' });
  }
});
```

## 4. Packing List Endpoints

```javascript
// Get packing list for user and hike
app.get('/api/hikes/:id/packing-list', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM packing_lists WHERE hike_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      // Return default packing list based on hike type
      const hikeResult = await pool.query('SELECT type FROM hikes WHERE id = $1', [id]);
      const isMultiDay = hikeResult.rows[0]?.type === 'multi';

      const defaultItems = isMultiDay ? [
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

      return res.json({ items: defaultItems });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get packing list error:', error);
    res.status(500).json({ error: 'Failed to fetch packing list' });
  }
});

// Update packing list
app.put('/api/hikes/:id/packing-list', authenticateToken, async (req, res) => {
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
});
```

## 5. My Hikes Dashboard Endpoint

```javascript
// Get user's hikes dashboard
app.get('/api/my-hikes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hikes user is interested in
    const interested = await pool.query(
      `SELECT h.*,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id) as interested_count,
              (SELECT COUNT(*) FROM hike_attendees WHERE hike_id = h.id) as confirmed_count
       FROM hikes h
       JOIN hike_interest i ON h.id = i.hike_id
       WHERE i.user_id = $1 AND h.date >= CURRENT_DATE
       ORDER BY h.date ASC`,
      [userId]
    );

    // Get hikes user is confirmed for
    const confirmed = await pool.query(
      `SELECT h.*, a.payment_status, a.amount_paid,
              (SELECT COUNT(*) FROM hike_interest WHERE hike_id = h.id) as interested_count,
              (SELECT COUNT(*) FROM hike_attendees WHERE hike_id = h.id) as confirmed_count
       FROM hikes h
       JOIN hike_attendees a ON h.id = a.hike_id
       WHERE a.user_id = $1 AND h.date >= CURRENT_DATE
       ORDER BY h.date ASC`,
      [userId]
    );

    // Get past hikes user attended
    const past = await pool.query(
      `SELECT h.*
       FROM hikes h
       JOIN hike_attendees a ON h.id = a.hike_id
       WHERE a.user_id = $1 AND h.date < CURRENT_DATE
       ORDER BY h.date DESC
       LIMIT 10`,
      [userId]
    );

    // Calculate stats
    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_hikes,
        COUNT(CASE WHEN h.type = 'multi' THEN 1 END) as multi_day_hikes
       FROM hikes h
       JOIN hike_attendees a ON h.id = a.hike_id
       WHERE a.user_id = $1 AND h.date < CURRENT_DATE`,
      [userId]
    );

    res.json({
      interested: interested.rows,
      confirmed: confirmed.rows,
      past: past.rows,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Get my hikes error:', error);
    res.status(500).json({ error: 'Failed to fetch hikes' });
  }
});
```

## 6. Emergency Contact Endpoints

```javascript
// Update emergency contact info
app.put('/api/profile/emergency-contact', authenticateToken, async (req, res) => {
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
});

// Get emergency contacts for hike (Admin only)
app.get('/api/hikes/:id/emergency-contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.name, u.phone, u.email, u.emergency_contact_name, u.emergency_contact_phone, u.medical_info
       FROM users u
       JOIN hike_attendees a ON u.id = a.user_id
       WHERE a.hike_id = $1
       ORDER BY u.name ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});
```

## 7. Update Hike Endpoints

Make sure to update the hike creation and editing endpoints to accept the new fields:
- `image_url`
- `destination_url`
- `daily_distances` (parse JSON before saving)
- `overnight_facilities`

```javascript
// In the POST /api/hikes endpoint, add:
const { name, date, difficulty, distance, description, type, cost, group, status, image_url, destination_url, daily_distances, overnight_facilities } = req.body;

// In the INSERT query:
INSERT INTO hikes (name, date, difficulty, distance, description, type, cost, group_type, status, image_url, destination_url, daily_distances, overnight_facilities, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())

// In the PUT /api/hikes/:id endpoint, add same fields
```
