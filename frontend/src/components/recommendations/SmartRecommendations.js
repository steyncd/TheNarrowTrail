import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const SmartRecommendations = () => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const allHikes = await api.getHikes(token);
      const userHikes = await api.getMyHikes(token);
      const userProfile = currentUser;

      // Get events user is already interested in or confirmed for
      const userEventIds = new Set([
        ...(userHikes.interested || []).map(h => h.id),
        ...(userHikes.confirmed || []).map(h => h.id),
        ...(userHikes.attended || []).map(h => h.id)
      ]);

      // Filter out past events and events user is already involved with
      const today = new Date();
      const availableEvents = allHikes.filter(hike => {
        const hikeDate = new Date(hike.date);
        return hikeDate >= today && !userEventIds.has(hike.id) && hike.status !== 'cancelled';
      });

      // Calculate recommendation scores
      const scoredEvents = availableEvents.map(event => {
        let score = 0;
        const reasons = [];

        // Score based on difficulty preference
        if (userProfile?.preferred_difficulty && event.difficulty === userProfile.preferred_difficulty) {
          score += 30;
          reasons.push('Matches your difficulty preference');
        }

        // Score based on previously attended event types
        const attendedTypes = (userHikes.attended || []).map(h => h.event_type || 'hiking');
        const eventType = event.event_type || 'hiking';
        if (attendedTypes.includes(eventType)) {
          score += 25;
          reasons.push(`You've enjoyed ${eventType} events before`);
        }

        // Score based on upcoming soon (encourage timely registration)
        const daysUntilEvent = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
        if (daysUntilEvent <= 14) {
          score += 15;
          reasons.push('Coming up soon');
        }

        // Score based on event status (trip_booked is more attractive)
        if (event.status === 'trip_booked') {
          score += 20;
          reasons.push('Trip confirmed and booked');
        } else if (event.status === 'final_planning') {
          score += 10;
          reasons.push('In final planning stage');
        }

        // Score based on participation (popular events)
        const totalParticipants = (event.confirmed_count || 0) + (event.interested_count || 0);
        if (totalParticipants >= 10) {
          score += 15;
          reasons.push(`${totalParticipants} people interested`);
        } else if (totalParticipants >= 5) {
          score += 10;
          reasons.push('Growing interest');
        }

        // Bonus for free events
        if (!event.cost || event.cost === 0) {
          score += 5;
          reasons.push('Free event');
        }

        // Boost newer events to encourage discovery
        const daysSinceCreated = Math.ceil((today - new Date(event.created_at || event.date)) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated <= 7) {
          score += 10;
          reasons.push('Recently added');
        }

        return {
          ...event,
          recommendationScore: score,
          recommendationReasons: reasons
        };
      });

      // Sort by score and take top 3
      const topRecommendations = scoredEvents
        .filter(e => e.recommendationScore > 0)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 3);

      setRecommendations(topRecommendations);
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
      expert: 'danger'
    };
    return colors[difficulty?.toLowerCase()] || 'secondary';
  };

  if (loading) {
    return (
      <div className="card" style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3 mb-0">Finding perfect events for you...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="card" style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}>
        <div className="card-body text-center py-5">
          <Sparkles size={48} className="text-muted mb-3" />
          <h5>No New Recommendations</h5>
          <p className="text-muted">You're all caught up! Check back later for new event suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Sparkles size={24} className="text-primary" />
        <h4 className="mb-0">Recommended For You</h4>
      </div>

      <div className="row g-3">
        {recommendations.map((event, index) => (
          <div key={event.id} className="col-12 col-md-6 col-lg-4">
            <div
              className="card h-100 hover-card"
              style={{
                background: theme === 'dark' ? 'var(--card-bg)' : 'white',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => navigate(`/hikes/${event.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {index === 0 && (
                <div
                  className="position-absolute top-0 start-0 m-2"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}
                >
                  <TrendingUp size={12} className="me-1" />
                  Top Pick
                </div>
              )}

              {event.image_url && (
                <div style={{ height: '150px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                  <img
                    src={event.image_url}
                    alt={event.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <h5 className="card-title mb-0" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                    <span className="me-2">{getEventTypeEmoji(event.event_type || 'hiking')}</span>
                    {event.name}
                  </h5>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge bg-${getDifficultyColor(event.difficulty)}`}>
                    {event.difficulty}
                  </span>
                  {event.cost > 0 && (
                    <span className="badge bg-info">R{event.cost}</span>
                  )}
                </div>

                <div className="small text-muted mb-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Calendar size={14} />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {event.location && (
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {event.recommendationReasons.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme === 'dark' ? 'var(--border-color)' : '#dee2e6'}` }}>
                    <p className="small mb-2" style={{ color: '#667eea', fontWeight: '600' }}>
                      Why this event?
                    </p>
                    <ul className="small mb-0" style={{ paddingLeft: '20px', listStyle: 'none' }}>
                      {event.recommendationReasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="mb-1">
                          <span style={{ color: '#667eea' }}>✓</span> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="card-footer" style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
                borderTop: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
              }}>
                <button
                  className="btn btn-sm btn-primary w-100"
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
        ))}
      </div>

      <style>{`
        .hover-card {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default SmartRecommendations;
