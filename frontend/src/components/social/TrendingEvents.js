import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, MapPin, ArrowRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import './TrendingEvents.css';

/**
 * TrendingEvents Component
 *
 * Shows popular events based on:
 * - Number of interested/confirmed users
 * - Recent activity (new registrations)
 * - Time-based trends (gaining momentum)
 */
const TrendingEvents = ({ limit = 5, showDetails = true }) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingEvents();
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchTrendingEvents = async () => {
    try {
      setLoading(true);
      const allHikes = await api.getHikes(token);

      // Filter upcoming events only
      const today = new Date();
      const upcomingEvents = allHikes.filter(hike => {
        const hikeDate = new Date(hike.date);
        return hikeDate >= today && hike.status !== 'cancelled';
      });

      // Calculate trending score
      const scored = upcomingEvents.map(event => {
        const totalParticipants = (event.confirmed_count || 0) + (event.interested_count || 0);
        const daysUntilEvent = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
        const daysSinceCreated = Math.ceil((today - new Date(event.created_at || event.date)) / (1000 * 60 * 60 * 24));

        // Trending score algorithm
        let score = 0;

        // Base popularity (50% weight)
        score += totalParticipants * 5;

        // Momentum bonus - newer events with good participation
        if (daysSinceCreated <= 7 && totalParticipants >= 5) {
          score += 30; // New and popular
        } else if (daysSinceCreated <= 14 && totalParticipants >= 3) {
          score += 15; // Building momentum
        }

        // Urgency factor - events happening soon
        if (daysUntilEvent <= 14) {
          score += Math.max(0, 14 - daysUntilEvent) * 2;
        }

        // Capacity nearing full
        if (event.capacity && totalParticipants / event.capacity > 0.75) {
          score += 20; // Almost full
        }

        // Status bonus
        if (event.status === 'trip_booked') {
          score += 15;
        }

        return {
          ...event,
          trendingScore: score,
          totalParticipants,
          daysUntilEvent,
          daysSinceCreated,
          isTrending: score > 40
        };
      });

      // Sort by trending score and take top N
      const trending = scored
        .filter(e => e.trendingScore > 20) // Only show events with meaningful activity
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);

      setTrendingEvents(trending);
    } catch (error) {
      console.error('Error fetching trending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingLabel = (event) => {
    if (event.daysSinceCreated <= 3) {
      return { text: 'New & Hot', color: '#FF5722', icon: Flame };
    } else if (event.totalParticipants >= 15) {
      return { text: 'Very Popular', color: '#4CAF50', icon: Users };
    } else if (event.daysUntilEvent <= 7) {
      return { text: 'Happening Soon', color: '#FF9800', icon: Calendar };
    } else if (event.capacity && event.totalParticipants / event.capacity > 0.75) {
      return { text: 'Almost Full', color: '#F44336', icon: Users };
    }
    return { text: 'Trending', color: '#2196F3', icon: TrendingUp };
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

  if (loading) {
    return (
      <div className="trending-events-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading trending events...</span>
        </div>
      </div>
    );
  }

  if (trendingEvents.length === 0) {
    return (
      <div className="trending-events-empty">
        <TrendingUp size={48} className="text-muted mb-3" />
        <p className="text-muted">No trending events at the moment. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="trending-events" data-theme={theme}>
      <div className="trending-header">
        <div className="d-flex align-items-center gap-2">
          <Flame size={24} className="text-danger" />
          <h4 className="mb-0">Trending Events</h4>
        </div>
        <p className="text-muted small mb-0">Popular events gaining momentum</p>
      </div>

      <div className="trending-list">
        {trendingEvents.map((event, index) => {
          const label = getTrendingLabel(event);
          const TrendIcon = label.icon;

          return (
            <div
              key={event.id}
              className="trending-event-card"
              onClick={() => navigate(`/hikes/${event.id}`)}
            >
              {/* Trending Badge */}
              <div className="trending-badge" style={{ backgroundColor: label.color }}>
                <TrendIcon size={14} />
                <span>{label.text}</span>
              </div>

              {/* Rank */}
              <div className="trending-rank">
                <span className="rank-number">#{index + 1}</span>
                {index === 0 && <Flame size={16} fill="#FF5722" stroke="#FF5722" />}
              </div>

              {/* Event Content */}
              <div className="trending-event-content">
                <div className="event-title-row">
                  <h5 className="event-title">
                    <span className="me-2">{getEventTypeEmoji(event.event_type || 'hiking')}</span>
                    {event.name}
                  </h5>
                </div>

                {showDetails && (
                  <div className="event-details-row">
                    <div className="detail-item">
                      <Users size={14} />
                      <span>{event.totalParticipants} interested</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {event.location && (
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{event.location.split(',')[0]}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar (if capacity known) */}
                {event.capacity && (
                  <div className="capacity-progress">
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${Math.min(100, (event.totalParticipants / event.capacity) * 100)}%`,
                        backgroundColor: event.totalParticipants / event.capacity > 0.75 ? '#F44336' : '#4CAF50'
                      }}
                    />
                  </div>
                )}

                {/* Trending Reasons */}
                <div className="trending-reasons">
                  {event.daysSinceCreated <= 3 && (
                    <span className="reason-badge new">New</span>
                  )}
                  {event.daysUntilEvent <= 7 && (
                    <span className="reason-badge urgent">Soon</span>
                  )}
                  {event.totalParticipants >= 15 && (
                    <span className="reason-badge popular">Popular</span>
                  )}
                  {event.status === 'trip_booked' && (
                    <span className="reason-badge confirmed">Confirmed</span>
                  )}
                </div>
              </div>

              <div className="trending-event-action">
                <ArrowRight size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {trendingEvents.length > 0 && (
        <div className="trending-footer">
          <button
            className="btn btn-outline-primary btn-sm w-100"
            onClick={() => navigate('/hikes')}
          >
            View All Events
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingEvents;
