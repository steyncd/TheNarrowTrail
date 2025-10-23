// routes/reviews.js - Event Reviews API
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// GET /api/hikes/:hikeId/reviews - Get all reviews for an event
router.get('/hikes/:hikeId/reviews', authenticateToken, async (req, res) => {
  const { hikeId } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      // Get all reviews for this event with user information
      const reviewsQuery = `
        SELECT
          er.*,
          u.name as user_name,
          u.profile_photo_url as user_photo,
          EXISTS (
            SELECT 1 FROM review_helpful_votes rhv
            WHERE rhv.review_id = er.id AND rhv.user_id = $2
          ) as user_has_marked_helpful
        FROM event_reviews er
        JOIN users u ON er.user_id = u.id
        WHERE er.hike_id = $1
        ORDER BY er.created_at DESC
      `;

      const reviewsResult = await client.query(reviewsQuery, [hikeId, userId]);

      // Get average rating and count
      const statsQuery = `
        SELECT
          COALESCE(AVG(rating), 0) as average_rating,
          COUNT(*) as total_reviews,
          COUNT(*) FILTER (WHERE rating = 5) as five_star,
          COUNT(*) FILTER (WHERE rating = 4) as four_star,
          COUNT(*) FILTER (WHERE rating = 3) as three_star,
          COUNT(*) FILTER (WHERE rating = 2) as two_star,
          COUNT(*) FILTER (WHERE rating = 1) as one_star,
          COUNT(*) FILTER (WHERE would_recommend = true) as would_recommend_count
        FROM event_reviews
        WHERE hike_id = $1
      `;

      const statsResult = await client.query(statsQuery, [hikeId]);

      res.json({
        reviews: reviewsResult.rows,
        stats: statsResult.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/hikes/:hikeId/reviews - Submit a review for an event
router.post('/hikes/:hikeId/reviews', authenticateToken, async (req, res) => {
  const { hikeId } = req.params;
  const userId = req.user.id;
  const { rating, title, comment, wouldRecommend } = req.body;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  if (comment.length > 1000) {
    return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
  }

  if (title && title.length > 100) {
    return res.status(400).json({ error: 'Title must be 100 characters or less' });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user has attended this event (optional - can be removed if you want to allow all reviews)
      const attendanceQuery = `
        SELECT 1 FROM hike_interest
        WHERE hike_id = $1 AND user_id = $2 AND status IN ('confirmed', 'attended')
      `;
      const attendanceResult = await client.query(attendanceQuery, [hikeId, userId]);

      // If you want to require attendance, uncomment this:
      // if (attendanceResult.rows.length === 0) {
      //   await client.query('ROLLBACK');
      //   return res.status(403).json({ error: 'You must attend the event to leave a review' });
      // }

      // Insert or update review
      const insertQuery = `
        INSERT INTO event_reviews (hike_id, user_id, rating, title, comment, would_recommend)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (hike_id, user_id)
        DO UPDATE SET
          rating = EXCLUDED.rating,
          title = EXCLUDED.title,
          comment = EXCLUDED.comment,
          would_recommend = EXCLUDED.would_recommend,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        hikeId,
        userId,
        rating,
        title || null,
        comment.trim(),
        wouldRecommend !== false // Default to true
      ]);

      await client.query('COMMIT');

      res.json({
        success: true,
        review: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting review:', error);

    if (error.code === '23503') {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// POST /api/reviews/:reviewId/helpful - Mark a review as helpful
router.post('/reviews/:reviewId/helpful', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if already marked as helpful
      const existingQuery = `
        SELECT 1 FROM review_helpful_votes
        WHERE review_id = $1 AND user_id = $2
      `;
      const existing = await client.query(existingQuery, [reviewId, userId]);

      if (existing.rows.length > 0) {
        // Already marked - remove the vote (toggle)
        await client.query(
          'DELETE FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2',
          [reviewId, userId]
        );
      } else {
        // Add helpful vote
        await client.query(
          'INSERT INTO review_helpful_votes (review_id, user_id) VALUES ($1, $2)',
          [reviewId, userId]
        );
      }

      // Get updated review
      const reviewQuery = `
        SELECT er.*, u.name as user_name
        FROM event_reviews er
        JOIN users u ON er.user_id = u.id
        WHERE er.id = $1
      `;
      const reviewResult = await client.query(reviewQuery, [reviewId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        review: reviewResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error marking review as helpful:', error);

    if (error.code === '23503') {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

// DELETE /api/reviews/:reviewId - Delete your own review
router.delete('/reviews/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      // Check if review belongs to user or user is admin
      const checkQuery = `
        SELECT user_id FROM event_reviews WHERE id = $1
      `;
      const checkResult = await client.query(checkQuery, [reviewId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const isOwner = checkResult.rows[0].user_id === userId;
      const isAdmin = req.user.role === 'admin'; // Adjust based on your permission system

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to delete this review' });
      }

      // Delete review (helpful votes will cascade)
      await client.query('DELETE FROM event_reviews WHERE id = $1', [reviewId]);

      res.json({ success: true, message: 'Review deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// GET /api/reviews/my-reviews - Get current user's reviews
router.get('/reviews/my-reviews', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const client = await pool.connect();

    try {
      const query = `
        SELECT
          er.*,
          h.name as hike_name,
          h.date as hike_date,
          h.location as hike_location
        FROM event_reviews er
        JOIN hikes h ON er.hike_id = h.id
        WHERE er.user_id = $1
        ORDER BY er.created_at DESC
      `;

      const result = await client.query(query, [userId]);

      res.json({
        reviews: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});

module.exports = router;
