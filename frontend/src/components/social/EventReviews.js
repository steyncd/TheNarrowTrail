import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Calendar, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import './EventReviews.css';

/**
 * EventReviews Component
 *
 * Provides social features for events:
 * - Star ratings (1-5)
 * - Text reviews
 * - Helpful votes
 * - Review filtering and sorting
 */
const EventReviews = ({ hikeId, eventName }) => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    wouldRecommend: true
  });
  const [filter, setFilter] = useState('all'); // all, 5-star, 4-star, etc.
  const [sort, setSort] = useState('recent'); // recent, helpful, rating
  const [userHasReview, setUserHasReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hikeId, token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // This endpoint needs to be created on backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hikes/${hikeId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setUserHasReview(data.reviews?.some(r => r.user_id === currentUser?.id));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hikes/${hikeId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        await fetchReviews();
        setShowForm(false);
        setNewReview({
          rating: 5,
          title: '',
          comment: '',
          wouldRecommend: true
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            fill={star <= rating ? '#FFC107' : 'none'}
            stroke={star <= rating ? '#FFC107' : '#ccc'}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const getRatingStats = () => {
    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
    }));

    return { avgRating, total: reviews.length, ratingCounts };
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;

    // Apply filter
    if (filter !== 'all') {
      const filterRating = parseInt(filter);
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sort === 'helpful') {
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      } else if (sort === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return sorted;
  };

  const stats = getRatingStats();
  const filteredReviews = getFilteredAndSortedReviews();

  if (loading) {
    return (
      <div className="event-reviews-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="event-reviews" data-theme={theme}>
      <div className="reviews-header">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            <MessageCircle size={24} className="me-2" />
            Reviews & Ratings
          </h4>
          {!userHasReview && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Stats */}
        {stats && (
          <div className="review-stats-container">
            <div className="review-stats-summary">
              <div className="average-rating">
                <h1 className="rating-number">{stats.avgRating}</h1>
                {renderStars(Math.round(parseFloat(stats.avgRating)))}
                <p className="text-muted small mb-0">{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
              </div>

              <div className="rating-breakdown">
                {stats.ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="rating-bar-container">
                    <span className="rating-label">{rating} star</span>
                    <div className="rating-bar-wrapper">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="review-form-container">
            <form onSubmit={handleSubmitReview} className="review-form">
              <h5>Share Your Experience</h5>

              <div className="mb-3">
                <label className="form-label">Rating</label>
                {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
              </div>

              <div className="mb-3">
                <label className="form-label">Title (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Summary of your experience"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Your Review</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell us about your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  maxLength={1000}
                />
                <small className="text-muted">
                  {newReview.comment.length}/1000 characters
                </small>
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="wouldRecommend"
                  checked={newReview.wouldRecommend}
                  onChange={(e) => setNewReview({ ...newReview, wouldRecommend: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="wouldRecommend">
                  I would recommend this event
                </label>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !newReview.comment.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Sort */}
        {reviews.length > 0 && (
          <div className="review-controls">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  className={`filter-btn ${filter === String(rating) ? 'active' : ''}`}
                  onClick={() => setFilter(String(rating))}
                >
                  {rating} <Star size={12} fill="#FFC107" stroke="#FFC107" />
                </button>
              ))}
            </div>

            <select
              className="form-select form-select-sm sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <MessageCircle size={48} className="text-muted mb-3" />
            <p className="text-muted">
              {reviews.length === 0
                ? 'No reviews yet. Be the first to share your experience!'
                : 'No reviews match your filter criteria.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="reviewer-name">{review.user_name || 'Anonymous'}</div>
                    <div className="review-date">
                      <Calendar size={12} />
                      <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {review.title && (
                <h6 className="review-title">{review.title}</h6>
              )}

              <p className="review-text">{review.comment}</p>

              {review.would_recommend && (
                <div className="review-recommend">
                  <ThumbsUp size={14} />
                  <span>Recommends this event</span>
                </div>
              )}

              <div className="review-footer">
                <button
                  className="helpful-btn"
                  onClick={() => handleHelpful(review.id)}
                  disabled={review.user_has_marked_helpful}
                >
                  <ThumbsUp size={14} />
                  <span>Helpful ({review.helpful_count || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventReviews;
