import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin, Calendar, ArrowRight, Star, ThumbsUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LazyImage from '../photos/LazyImage';
import './SmartRecommendationsEnhanced.css';

/**
 * Enhanced SmartRecommendations Component
 *
 * Improvements over original:
 * - Match percentage display (0-100%)
 * - Improved scoring algorithm with more factors
 * - Multiple recommendation sections (For You, Trending, New)
 * - Better visual design with match indicators
 * - Explanation of why events are recommended
 * - Swipeable cards on mobile (future)
 * - "Not interested" feedback (future)
 */
const SmartRecommendationsEnhanced = ({ limit = 6, showTrending = true, showNew = true }) => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState({
    forYou: [],
    trending: [],
    new: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const allHikes = await api.getHikes(token);
      const userHikes = await api.getMyHikes(token);
      const userProfile = currentUser;

      // Get events user is already involved with
      const userEventIds = new Set([
        ...(userHikes.interested || []).map(h => h.id),
        ...(userHikes.confirmed || []).map(h => h.id),
        ...(userHikes.attended || []).map(h => h.id)
      ]);

      // Filter available events
      const today = new Date();
      const availableEvents = allHikes.filter(hike => {
        const hikeDate = new Date(hike.date);
        return hikeDate >= today && !userEventIds.has(hike.id) && hike.status !== 'cancelled';
      });

      // Enhanced scoring algorithm
      const scoredEvents = availableEvents.map(event => {
        let score = 0;
        let maxPossibleScore = 0;
        const reasons = [];

        // 1. Difficulty Match (Weight: 25%)
        maxPossibleScore += 25;
        const eventDifficulty = event.event_type_data?.difficulty || event.difficulty;
        if (userProfile?.preferred_difficulty && eventDifficulty === userProfile.preferred_difficulty) {
          score += 25;
          reasons.push({ text: 'Matches your difficulty preference', weight: 'high' });
        } else if (userProfile?.preferred_difficulty) {
          // Partial match for adjacent difficulty levels
          const difficultyLevels = ['Easy', 'Moderate', 'Hard', 'Very Hard'];
          const userDiffIndex = difficultyLevels.indexOf(userProfile.preferred_difficulty);
          const eventDiffIndex = difficultyLevels.indexOf(eventDifficulty);
          const difference = Math.abs(userDiffIndex - eventDiffIndex);
          if (difference === 1) {
            score += 15;
            reasons.push({ text: 'Similar difficulty level', weight: 'medium' });
          } else if (difference === 2) {
            score += 8;
          }
        }

        // 2. Event Type Preference (Weight: 20%)
        maxPossibleScore += 20;
        const attendedTypes = (userHikes.attended || []).map(h => h.event_type || 'hiking');
        const eventType = event.event_type || 'hiking';
        const typeFrequency = attendedTypes.filter(t => t === eventType).length;
        if (typeFrequency > 0) {
          const typeScore = Math.min(20, typeFrequency * 5);
          score += typeScore;
          if (typeFrequency >= 3) {
            reasons.push({ text: `You love ${eventType} events`, weight: 'high' });
          } else {
            reasons.push({ text: `You've enjoyed ${eventType} before`, weight: 'medium' });
          }
        }

        // 3. Tag Matching (Weight: 15%)
        maxPossibleScore += 15;
        if (userProfile?.preferred_tags && event.tags) {
          const userTagIds = userProfile.preferred_tags;
          const eventTagIds = event.tags.map(t => t.id);
          const matchingTags = userTagIds.filter(id => eventTagIds.includes(id));
          if (matchingTags.length > 0) {
            const tagScore = Math.min(15, matchingTags.length * 5);
            score += tagScore;
            reasons.push({ text: `${matchingTags.length} matching interest${matchingTags.length > 1 ? 's' : ''}`, weight: 'medium' });
          }
        }

        // 4. Timing Factor (Weight: 15%)
        maxPossibleScore += 15;
        const daysUntilEvent = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
        if (daysUntilEvent <= 7) {
          score += 15;
          reasons.push({ text: 'Happening very soon!', weight: 'high' });
        } else if (daysUntilEvent <= 14) {
          score += 12;
          reasons.push({ text: 'Coming up soon', weight: 'medium' });
        } else if (daysUntilEvent <= 30) {
          score += 8;
        }

        // 5. Event Status & Popularity (Weight: 15%)
        maxPossibleScore += 15;
        if (event.status === 'trip_booked') {
          score += 12;
          reasons.push({ text: 'Trip confirmed', weight: 'high' });
        } else if (event.status === 'final_planning') {
          score += 8;
          reasons.push({ text: 'Final planning stage', weight: 'medium' });
        }

        const totalParticipants = (event.confirmed_count || 0) + (event.interested_count || 0);
        if (totalParticipants >= 15) {
          score += 3;
          reasons.push({ text: `${totalParticipants} people interested`, weight: 'low' });
        } else if (totalParticipants >= 8) {
          score += 2;
        }

        // 6. Location Preference (Weight: 10%)
        maxPossibleScore += 10;
        if (userProfile?.preferred_location && event.location) {
          const userLocation = userProfile.preferred_location.toLowerCase();
          const eventLocation = event.location.toLowerCase();
          if (eventLocation.includes(userLocation)) {
            score += 10;
            reasons.push({ text: 'In your preferred area', weight: 'medium' });
          }
        }

        // 7. Newness Boost
        const daysSinceCreated = Math.ceil((today - new Date(event.created_at || event.date)) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated <= 3) {
          score += 5;
          reasons.push({ text: 'Just added!', weight: 'low' });
        } else if (daysSinceCreated <= 7) {
          score += 3;
          reasons.push({ text: 'Recently added', weight: 'low' });
        }

        // 8. Cost Factor
        if (!event.cost || event.cost === 0) {
          score += 3;
          reasons.push({ text: 'Free event', weight: 'low' });
        }

        // Calculate match percentage (0-100%)
        const matchPercentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

        return {
          ...event,
          recommendationScore: score,
          matchPercentage,
          recommendationReasons: reasons.sort((a, b) => {
            const weights = { high: 3, medium: 2, low: 1 };
            return weights[b.weight] - weights[a.weight];
          })
        };
      });

      // Sort by score
      const sortedByScore = [...scoredEvents]
        .filter(e => e.matchPercentage >= 30) // Only show events with 30%+ match
        .sort((a, b) => b.recommendationScore - a.recommendationScore);

      // "For You" - Top personalized recommendations
      const forYouEvents = sortedByScore.slice(0, limit);

      // "Trending" - Popular events (by participant count)
      const trendingEvents = [...availableEvents]
        .filter(e => !forYouEvents.find(f => f.id === e.id))
        .sort((a, b) => {
          const aCount = (a.confirmed_count || 0) + (a.interested_count || 0);
          const bCount = (b.confirmed_count || 0) + (b.interested_count || 0);
          return bCount - aCount;
        })
        .slice(0, 3)
        .map(e => ({
          ...e,
          trendingReason: `${(e.confirmed_count || 0) + (e.interested_count || 0)} people interested`
        }));

      // "New" - Recently added events
      const newEvents = [...availableEvents]
        .filter(e => !forYouEvents.find(f => f.id === e.id) && !trendingEvents.find(t => t.id === e.id))
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        .slice(0, 3)
        .map(e => {
          const daysAgo = Math.ceil((today - new Date(e.created_at || e.date)) / (1000 * 60 * 60 * 24));
          return {
            ...e,
            newReason: daysAgo <= 1 ? 'Added today' : `Added ${daysAgo} days ago`
          };
        });

      setRecommendations({
        forYou: forYouEvents,
        trending: showTrending ? trendingEvents : [],
        new: showNew ? newEvents : []
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeEmoji = (eventType) => {
    const emojis = {
      'hiking': '🏔️',
      'camping': '⛺',
      'cycling': '🚴',
      '4x4': '🚙',
      'outdoor': '🏕️'
    };
    return emojis[eventType] || '📅';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      moderate: 'warning',
      hard: 'orange',
      'very hard': 'danger'
    };
    return colors[difficulty?.toLowerCase()] || 'secondary';
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#2196F3';
    if (percentage >= 40) return '#FF9800';
    return '#757575';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Great Match';
    if (percentage >= 40) return 'Good Match';
    return 'Possible Match';
  };

  const renderRecommendationCard = (event, showMatch = true) => {
    const eventDifficulty = event.event_type_data?.difficulty || event.difficulty;

    return (
      <div key={event.id} className="col-12 col-md-6 col-lg-4">
        <div
          className="recommendation-card"
          onClick={() => navigate(`/hikes/${event.id}`)}
        >
          {/* Match Badge */}
          {showMatch && event.matchPercentage && (
            <div className="match-badge" style={{ backgroundColor: getMatchColor(event.matchPercentage) }}>
              <Star size={12} fill="white" />
              <span>{event.matchPercentage}% Match</span>
            </div>
          )}

          {/* Event Image */}
          {event.image_url ? (
            <div className="recommendation-image">
              <LazyImage
                src={event.image_url}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className="recommendation-image-placeholder">
              <span style={{ fontSize: '3rem' }}>{getEventTypeEmoji(event.event_type || 'hiking')}</span>
            </div>
          )}

          <div className="recommendation-content">
            {/* Title */}
            <h5 className="recommendation-title">
              <span className="me-2">{getEventTypeEmoji(event.event_type || 'hiking')}</span>
              {event.name}
            </h5>

            {/* Badges */}
            <div className="recommendation-badges">
              {eventDifficulty && (
                <span className={`badge bg-${getDifficultyColor(eventDifficulty)}`}>
                  {eventDifficulty}
                </span>
              )}
              {event.cost > 0 && (
                <span className="badge bg-info">R{event.cost}</span>
              )}
              {(!event.cost || event.cost === 0) && (
                <span className="badge bg-success">Free</span>
              )}
            </div>

            {/* Event Details */}
            <div className="recommendation-details">
              <div className="detail-item">
                <Calendar size={14} />
                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {event.location && (
                <div className="detail-item">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Recommendation Reasons */}
            {event.recommendationReasons && event.recommendationReasons.length > 0 && (
              <div className="recommendation-reasons">
                <p className="reasons-title">
                  {getMatchLabel(event.matchPercentage)}
                </p>
                <ul className="reasons-list">
                  {event.recommendationReasons.slice(0, 3).map((reason, idx) => (
                    <li key={idx} className={`reason-item reason-${reason.weight}`}>
                      <span className="reason-check">✓</span>
                      <span>{reason.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trending Reason */}
            {event.trendingReason && (
              <div className="trending-badge">
                <TrendingUp size={14} />
                <span>{event.trendingReason}</span>
              </div>
            )}

            {/* New Reason */}
            {event.newReason && (
              <div className="new-badge">
                <Sparkles size={14} />
                <span>{event.newReason}</span>
              </div>
            )}
          </div>

          <div className="recommendation-footer">
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/hikes/${event.id}`);
              }}
            >
              View Details <ArrowRight size={14} className="ms-1" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Finding perfect events for you...</p>
      </div>
    );
  }

  const hasRecommendations = recommendations.forYou.length > 0 ||
                            recommendations.trending.length > 0 ||
                            recommendations.new.length > 0;

  if (!hasRecommendations) {
    return (
      <div className="recommendations-empty">
        <Sparkles size={48} className="text-muted mb-3" />
        <h5>No New Recommendations</h5>
        <p className="text-muted">
          You're all caught up! Check back later for new event suggestions.
        </p>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/profile')}
        >
          Update Your Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="smart-recommendations-enhanced">
      {/* For You Section */}
      {recommendations.forYou.length > 0 && (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <Heart size={24} className="text-danger" fill="currentColor" />
              <h4>Recommended For You</h4>
            </div>
            <p className="section-subtitle">
              Based on your preferences and history
            </p>
          </div>
          <div className="row g-3">
            {recommendations.forYou.map(event => renderRecommendationCard(event, true))}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {recommendations.trending.length > 0 && (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <TrendingUp size={24} className="text-warning" />
              <h4>Trending Now</h4>
            </div>
            <p className="section-subtitle">
              Popular events with lots of interest
            </p>
          </div>
          <div className="row g-3">
            {recommendations.trending.map(event => renderRecommendationCard(event, false))}
          </div>
        </div>
      )}

      {/* New Events Section */}
      {recommendations.new.length > 0 && (
        <div className="recommendation-section">
          <div className="section-header">
            <div className="section-title">
              <Sparkles size={24} className="text-info" />
              <h4>New Events</h4>
            </div>
            <p className="section-subtitle">
              Recently added events you might enjoy
            </p>
          </div>
          <div className="row g-3">
            {recommendations.new.map(event => renderRecommendationCard(event, false))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendationsEnhanced;
